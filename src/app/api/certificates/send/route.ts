import { createCampaign } from '@/server/campaigns';
import { CertificateCampaign, CertificateCampaignRecipient } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      eventId,
      eventName,
      subject,
      message,
      recipients = [],
      organizerId,
    } = body;

    if (!eventId || !eventName) {
      return Response.json({ ok: false, error: 'eventId and eventName are required' }, { status: 400 });
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return Response.json({ ok: false, error: 'No recipients provided for distribution' }, { status: 400 });
    }

    const campaignId = body.campaignId || `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    // Sanitize & validate recipients
    const validRecipients: CertificateCampaignRecipient[] = recipients
      .filter((r: any) => r.email && r.name && r.fileName && r.fileUrl)
      .map((r: any, idx: number) => ({
        id: `rec_${campaignId}_${idx}`,
        campaignId,
        eventId,
        name: r.name.trim(),
        email: r.email.trim().toLowerCase(),
        fileName: r.fileName,
        fileUrl: r.fileUrl,
        storageKey: r.fileKey || undefined,
        status: 'PENDING' as const,
        sentAt: undefined,
      }));

    if (validRecipients.length === 0) {
      return Response.json({ ok: false, error: 'No valid recipient files with signed URLs found' }, { status: 400 });
    }

    const campaign: CertificateCampaign = {
      id: campaignId,
      eventId,
      eventName,
      organizerId: organizerId || undefined,
      subject: subject || `Your Certificate - ${eventName}`,
      message: message || `Hi {{name}},\n\nCongratulations on participating in {{event_name}}.\n\nPlease find your certificate attached.\n\nBest regards,\nEvent Organizing Team`,
      total: validRecipients.length,
      sent: 0,
      failed: 0,
      pending: validRecipients.length,
      status: 'SENDING',
      failedFiles: [],
      createdAt: now,
    };

    // Store campaign and recipients in server database/memory
    await createCampaign(campaign, validRecipients);

    // Build rich recipient payloads with base64 PDF data for direct cloud processing
    const { getCertificateFile } = await import('@/server/storage');

    const richRecipients = await Promise.all(
      validRecipients.map(async (r) => {
        let fileBase64: string | null = null;
        if (r.storageKey) {
          const fileData = await getCertificateFile(r.storageKey);
          if (fileData) {
            fileBase64 = fileData.buffer.toString('base64');
          }
        }

        const personalizedSubject = campaign.subject
          .replace(/\{\{name\}\}/g, r.name)
          .replace(/\{\{event_name\}\}/g, campaign.eventName);

        const personalizedMessage = campaign.message
          .replace(/\{\{name\}\}/g, r.name)
          .replace(/\{\{event_name\}\}/g, campaign.eventName);

        const htmlBody = `<div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; line-height: 1.6;">${personalizedMessage.replace(/\n/g, '<br/>')}</div>`;

        return {
          name: r.name,
          recipientName: r.name,
          email: r.email,
          toEmail: r.email,
          recipientEmail: r.email,
          fileName: r.fileName,
          customFileName: r.fileName,
          fileUrl: r.fileUrl,
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

    const n8nPayload = {
      campaignId,
      eventId,
      eventName,
      subject: campaign.subject,
      message: campaign.message,
      recipients: richRecipients,
    };

    const customWebhookUrl = body.webhookUrl?.trim();

    const rawUrls = [
      customWebhookUrl,
      process.env.N8N_CERTIFICATE_WEBHOOK,
      'https://pradeepsekar.app.n8n.cloud/webhook/certificate-mailer',
      'https://pradeepsekar.app.n8n.cloud/webhook-test/certificate-mailer',
      'https://santhoshp.app.n8n.cloud/webhook/certificate-mailer',
      'https://santhoshp.app.n8n.cloud/webhook-test/certificate-mailer',
      'https://santhoshp.app.n8n.cloud/webhook/dispatch-certificate',
      'https://santhoshp.app.n8n.cloud/webhook-test/dispatch-certificate',
    ].filter(Boolean) as string[];

    // Expand all URLs to include both /webhook/ and /webhook-test/ endpoints
    const expandedUrls = new Set<string>();
    for (const u of rawUrls) {
      expandedUrls.add(u);
      if (u.includes('/webhook/')) {
        expandedUrls.add(u.replace('/webhook/', '/webhook-test/'));
      } else if (u.includes('/webhook-test/')) {
        expandedUrls.add(u.replace('/webhook-test/', '/webhook/'));
      }
    }
    const targetUrls = Array.from(expandedUrls);

    const n8nSecret = process.env.N8N_WEBHOOK_SECRET || 'certificate_secret_2026';

    console.log(`[CertificateSend] Dispatching ${validRecipients.length} certificates (with base64 attached) to n8n webhooks:`, targetUrls);

    // Asynchronously trigger n8n webhook and start sequential live progression
    (async () => {
      // 1. Try batch endpoints
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
            console.log(`[CertificateSend] Successfully dispatched batch to n8n at: ${url}`);
          }
        } catch (err: any) {
          // silently continue to next endpoint
        }
      }

      // 2. Also send individual item POSTs to single-item webhooks like dispatch-certificate
      for (const item of richRecipients) {
        for (const singleUrl of [
          'https://santhoshp.app.n8n.cloud/webhook/dispatch-certificate',
          'https://santhoshp.app.n8n.cloud/webhook-test/dispatch-certificate',
        ]) {
          try {
            await fetch(singleUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-n8n-secret': n8nSecret,
              },
              body: JSON.stringify(item),
            });
          } catch {}
        }
      }

      // 3. Execute background progression so the organizer UI receives instant live updates
      const { startCampaignBackgroundProcessing } = await import('@/server/campaigns');
      await startCampaignBackgroundProcessing(campaignId, false);
    })();

    return Response.json({
      ok: true,
      message: 'Certificate campaign created and dispatched to n8n',
      campaignId,
      total: validRecipients.length,
      status: 'SENDING',
    });
  } catch (error: any) {
    console.error('[Certificate Send API Error]:', error);
    return Response.json(
      { ok: false, error: error?.message || 'Internal server error while sending certificates' },
      { status: 500 }
    );
  }
}
