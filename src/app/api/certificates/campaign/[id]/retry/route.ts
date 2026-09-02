import { getFailedRecipientsForRetry, updateRecipientStatus } from '@/server/campaigns';
import { generateSignedToken } from '@/server/storage';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json({ ok: false, error: 'Campaign ID is required' }, { status: 400 });
    }

    const data = await getFailedRecipientsForRetry(id);
    if (!data || !data.campaign) {
      return Response.json({ ok: false, error: 'Campaign not found' }, { status: 404 });
    }

    const { campaign, failedRecipients } = data;

    if (failedRecipients.length === 0) {
      return Response.json({
        ok: false,
        error: 'No failed recipients found to retry. All recipients are either sent or processing.',
      }, { status: 400 });
    }

    const appBaseUrl =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get('origin') ||
      'http://localhost:3000';

    // Refresh temporary signed URLs and attach base64 PDF data if available
    const { getCertificateFile } = await import('@/server/storage');

    const recipientsToRetry = await Promise.all(
      failedRecipients.map(async (rec) => {
        let fileUrl = rec.fileUrl;
        let fileBase64: string | null = null;
        if (rec.storageKey) {
          const token = generateSignedToken(rec.storageKey, rec.fileName, 3600);
          fileUrl = `${appBaseUrl.replace(/\/$/, '')}/api/certificates/download/${token}`;
          const fileData = await getCertificateFile(rec.storageKey);
          if (fileData) {
            fileBase64 = fileData.buffer.toString('base64');
          }
        }

        const personalizedSubject = campaign.subject
          .replace(/\{\{name\}\}/g, rec.name)
          .replace(/\{\{event_name\}\}/g, campaign.eventName);

        const personalizedMessage = campaign.message
          .replace(/\{\{name\}\}/g, rec.name)
          .replace(/\{\{event_name\}\}/g, campaign.eventName);

        const htmlBody = `<div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; line-height: 1.6;">${personalizedMessage.replace(/\n/g, '<br/>')}</div>`;

        return {
          name: rec.name,
          recipientName: rec.name,
          email: rec.email,
          toEmail: rec.email,
          recipientEmail: rec.email,
          fileName: rec.fileName,
          customFileName: rec.fileName,
          fileUrl: fileUrl,
          fileBase64: fileBase64,
          subject: personalizedSubject,
          message: personalizedMessage,
          html: htmlBody,
          eventTitle: campaign.eventName,
          eventName: campaign.eventName,
          eventId: campaign.eventId,
          campaignId: campaign.id,
        };
      })
    );

    // Mark failed recipients as SENDING in campaign
    for (const rec of failedRecipients) {
      await updateRecipientStatus({
        campaignId: campaign.id,
        recipientEmail: rec.email,
        fileName: rec.fileName,
        status: 'SENDING',
        error: undefined,
      });
    }

    const n8nPayload = {
      campaignId: campaign.id,
      eventId: campaign.eventId,
      eventName: campaign.eventName,
      subject: campaign.subject,
      message: campaign.message,
      isRetry: true,
      recipients: recipientsToRetry,
    };

    const targetUrls = [
      process.env.N8N_CERTIFICATE_WEBHOOK,
      'https://pradeepsekar.app.n8n.cloud/webhook/certificate-mailer',
      'https://pradeepsekar.app.n8n.cloud/webhook-test/certificate-mailer',
      'https://santhoshp.app.n8n.cloud/webhook/certificate-mailer',
      'https://santhoshp.app.n8n.cloud/webhook-test/certificate-mailer',
      'https://santhoshp.app.n8n.cloud/webhook/dispatch-certificate',
    ].filter(Boolean) as string[];

    const n8nSecret = process.env.N8N_WEBHOOK_SECRET || 'certificate_secret_2026';

    console.log(`[CertificateRetry] Retrying ${recipientsToRetry.length} failed recipients for campaign ${campaign.id}`);

    // Non-blocking trigger to n8n
    (async () => {
      for (const url of targetUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-n8n-secret': n8nSecret,
            },
            body: JSON.stringify(n8nPayload),
          });
          if (res.ok) {
            console.log(`[CertificateRetry] n8n retry triggered successfully at ${url}`);
          }
        } catch (err: any) {}
      }

      for (const item of recipientsToRetry) {
        try {
          await fetch('https://santhoshp.app.n8n.cloud/webhook/dispatch-certificate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-n8n-secret': n8nSecret,
            },
            body: JSON.stringify(item),
          });
        } catch {}
      }

      // Execute background progression for retried items
      const { startCampaignBackgroundProcessing } = await import('@/server/campaigns');
      await startCampaignBackgroundProcessing(campaign.id, true);
    })();

    return Response.json({
      ok: true,
      message: `Retrying ${recipientsToRetry.length} failed recipients`,
      retriedCount: recipientsToRetry.length,
      campaignId: campaign.id,
    });
  } catch (error: any) {
    console.error('[Certificate Retry Error]:', error);
    return Response.json({ ok: false, error: error?.message || 'Failed to retry recipients' }, { status: 500 });
  }
}
