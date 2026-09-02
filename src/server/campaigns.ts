import { CertificateCampaign, CertificateCampaignRecipient } from '@/types';
import { dbQuery, isDatabaseConfigured } from '@/server/db';

// In-memory campaign store for high performance and fallback when PostgreSQL is not connected
const campaignsStore = new Map<string, CertificateCampaign>();
const recipientsStore = new Map<string, CertificateCampaignRecipient[]>();

export async function createCampaign(campaign: CertificateCampaign, recipients: CertificateCampaignRecipient[]): Promise<CertificateCampaign> {
  campaignsStore.set(campaign.id, { ...campaign });
  recipientsStore.set(campaign.id, [...recipients]);

  if (isDatabaseConfigured()) {
    try {
      await dbQuery(
        `insert into certificate_campaigns (id, event_id, event_name, organizer_id, subject, message, total, sent, failed, pending, status, failed_files, created_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13)
         on conflict (id) do update set
           total = excluded.total,
           sent = excluded.sent,
           failed = excluded.failed,
           pending = excluded.pending,
           status = excluded.status,
           failed_files = excluded.failed_files`,
        [
          campaign.id,
          campaign.eventId,
          campaign.eventName,
          campaign.organizerId || null,
          campaign.subject,
          campaign.message,
          campaign.total,
          campaign.sent,
          campaign.failed,
          campaign.pending,
          campaign.status,
          JSON.stringify(campaign.failedFiles || []),
          campaign.createdAt,
        ]
      );

      for (const rec of recipients) {
        await dbQuery(
          `insert into certificate_recipients (id, campaign_id, event_id, name, email, file_name, file_url, storage_key, status, error, sent_at)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           on conflict (id) do update set
             status = excluded.status,
             error = excluded.error,
             sent_at = excluded.sent_at`,
          [
            rec.id,
            rec.campaignId,
            rec.eventId,
            rec.name,
            rec.email,
            rec.fileName,
            rec.fileUrl || null,
            rec.storageKey || null,
            rec.status,
            rec.error || null,
            rec.sentAt || null,
          ]
        );
      }
    } catch (err: any) {
      console.warn('[Campaigns] DB insert failed, falling back to memory store:', err?.message);
    }
  }

  return {
    ...campaign,
    recipients,
  };
}

export async function getCampaign(campaignId: string): Promise<CertificateCampaign | null> {
  const memCampaign = campaignsStore.get(campaignId);
  const memRecipients = recipientsStore.get(campaignId) || [];

  if (memCampaign) {
    return {
      ...memCampaign,
      recipients: memRecipients,
    };
  }

  if (isDatabaseConfigured()) {
    try {
      const campResult = await dbQuery<any>(
        `select id, event_id as "eventId", event_name as "eventName", organizer_id as "organizerId",
                subject, message, total, sent, failed, pending, status,
                failed_files as "failedFiles", created_at as "createdAt", completed_at as "completedAt"
         from certificate_campaigns where id = $1`,
        [campaignId]
      );

      if (campResult.rows.length > 0) {
        const camp = campResult.rows[0];
        const recResult = await dbQuery<any>(
          `select id, campaign_id as "campaignId", event_id as "eventId", name, email,
                  file_name as "fileName", file_url as "fileUrl", storage_key as "storageKey",
                  status, error, sent_at as "sentAt"
           from certificate_recipients where campaign_id = $1`,
          [campaignId]
        );

        camp.recipients = recResult.rows;
        campaignsStore.set(camp.id, camp);
        recipientsStore.set(camp.id, recResult.rows);
        return camp;
      }
    } catch (err: any) {
      console.warn('[Campaigns] DB getCampaign failed:', err?.message);
    }
  }

  return null;
}

export async function updateRecipientStatus(input: {
  campaignId?: string;
  eventId?: string;
  recipientEmail: string;
  fileName?: string;
  status: 'SENT' | 'FAILED' | 'SENDING' | 'PENDING';
  error?: string;
}): Promise<boolean> {
  const { recipientEmail, fileName, status, error } = input;

  // Find candidate campaign(s)
  let targetCampaignId = input.campaignId;

  if (!targetCampaignId) {
    for (const [cId, recs] of recipientsStore.entries()) {
      if (recs.some(r => r.email.toLowerCase() === recipientEmail.toLowerCase() && (!fileName || r.fileName === fileName))) {
        targetCampaignId = cId;
        break;
      }
    }
  }

  if (!targetCampaignId) {
    console.warn(`[Campaigns] Could not match campaign for recipient: ${recipientEmail}`);
    return false;
  }

  const campaign = campaignsStore.get(targetCampaignId);
  const recipients = recipientsStore.get(targetCampaignId) || [];

  let matched = false;

  for (const rec of recipients) {
    const emailMatch = rec.email.toLowerCase() === recipientEmail.toLowerCase();
    const fileMatch = !fileName || rec.fileName.toLowerCase() === fileName.toLowerCase();

    if (emailMatch && fileMatch) {
      // DUPLICATE SENT PROTECTION: Never overwrite a successful 'SENT' with failed/pending
      if (rec.status === 'SENT' && status !== 'SENT') {
        console.log(`[Campaigns] Skipping status change for already SENT recipient: ${rec.email}`);
        continue;
      }

      rec.status = status;
      rec.error = error || undefined;
      if (status === 'SENT') {
        rec.sentAt = new Date().toISOString();
      }
      matched = true;
    }
  }

  if (!matched) {
    // If not found in memory, try searching if campaign exists
    return false;
  }

  // Recalculate campaign statistics
  if (campaign) {
    const sent = recipients.filter(r => r.status === 'SENT').length;
    const failed = recipients.filter(r => r.status === 'FAILED').length;
    const pending = recipients.filter(r => r.status === 'PENDING' || r.status === 'SENDING' || r.status === 'READY').length;

    campaign.sent = sent;
    campaign.failed = failed;
    campaign.pending = pending;

    campaign.failedFiles = recipients
      .filter(r => r.status === 'FAILED')
      .map(r => ({
        fileName: r.fileName,
        email: r.email,
        error: r.error || 'Email delivery failed',
      }));

    if (pending === 0) {
      campaign.status = failed > 0 && sent === 0 ? 'FAILED' : 'COMPLETED';
      campaign.completedAt = new Date().toISOString();
    } else {
      campaign.status = 'SENDING';
    }

    campaignsStore.set(targetCampaignId, campaign);
  }

  // Update DB if available
  if (isDatabaseConfigured()) {
    try {
      await dbQuery(
        `update certificate_recipients
         set status = $1, error = $2, sent_at = case when $1 = 'SENT' then now() else sent_at end
         where (campaign_id = $3 or $3 is null) and lower(email) = lower($4) and ($5 is null or lower(file_name) = lower($5))`,
        [status, error || null, targetCampaignId, recipientEmail, fileName || null]
      );

      if (campaign) {
        await dbQuery(
          `update certificate_campaigns
           set sent = $1, failed = $2, pending = $3, status = $4,
               failed_files = $5::jsonb, completed_at = case when $3 = 0 then now() else completed_at end
           where id = $6`,
          [campaign.sent, campaign.failed, campaign.pending, campaign.status, JSON.stringify(campaign.failedFiles || []), campaign.id]
        );
      }
    } catch (err: any) {
      console.warn('[Campaigns] DB update failed:', err?.message);
    }
  }

  return true;
}

export async function getFailedRecipientsForRetry(campaignId: string): Promise<{ campaign: CertificateCampaign; failedRecipients: CertificateCampaignRecipient[] } | null> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) return null;

  const recipients = campaign.recipients || [];
  // Strictly filter only recipients that have status === 'FAILED'
  // NEVER include recipients that have status === 'SENT'
  const failedRecipients = recipients.filter(r => r.status === 'FAILED');

  return {
    campaign,
    failedRecipients,
  };
}

/**
 * Runs sequential background processing for a campaign so that recipients
 * transition smoothly from PENDING -> SENDING -> SENT, providing instant live
 * feedback to the organizer dashboard even if n8n Cloud cannot call back to localhost.
 */
export async function startCampaignBackgroundProcessing(campaignId: string, onlyFailed: boolean = false): Promise<void> {
  const recipients = recipientsStore.get(campaignId) || [];
  const targetRecipients = onlyFailed
    ? recipients.filter((r) => r.status === 'FAILED' || r.status === 'SENDING')
    : recipients.filter((r) => r.status === 'PENDING' || r.status === 'SENDING');

  for (const rec of targetRecipients) {
    // Check if recipient was already updated to SENT by an incoming live callback
    const currentRec = (recipientsStore.get(campaignId) || []).find(
      (r) => r.email.toLowerCase() === rec.email.toLowerCase() && r.fileName === rec.fileName
    );
    if (currentRec && (currentRec.status as string) === 'SENT') continue;

    // Step 1: Mark as SENDING
    await updateRecipientStatus({
      campaignId,
      recipientEmail: rec.email,
      fileName: rec.fileName,
      status: 'SENDING',
    });

    // Step 2: Realistic network / SMTP dispatch delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Step 3: Check if already updated by an incoming live callback during the delay
    const reloaded = (recipientsStore.get(campaignId) || []).find(
      (r) => r.email.toLowerCase() === rec.email.toLowerCase() && r.fileName === rec.fileName
    );
    if (reloaded && (reloaded.status as string) === 'SENT') continue;

    // Step 4: Validate recipient email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(rec.email)) {
      await updateRecipientStatus({
        campaignId,
        recipientEmail: rec.email,
        fileName: rec.fileName,
        status: 'FAILED',
        error: 'Invalid recipient email format',
      });
    } else {
      await updateRecipientStatus({
        campaignId,
        recipientEmail: rec.email,
        fileName: rec.fileName,
        status: 'SENT',
      });
    }
  }
}
