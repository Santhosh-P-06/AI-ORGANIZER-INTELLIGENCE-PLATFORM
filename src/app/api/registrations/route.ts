import { INITIAL_REGISTRATIONS, INITIAL_EVENTS } from '@/data/initialData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const registrations = eventId
    ? INITIAL_REGISTRATIONS.filter((registration) => registration.eventId === eventId)
    : INITIAL_REGISTRATIONS;

  return Response.json({ registrations });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const registrationId = body.id || `reg_${Date.now()}`;
  const registration = {
    id: registrationId,
    ...body,
  };

  console.log(`[Registration] Registration created successfully: ${registrationId}`);

  // --- n8n Registration Confirmation Webhook ---
  // Default to n8n Cloud webhook if environment variable is not defined
  const n8nWebhookUrl =
    process.env.N8N_REGISTRATION_WEBHOOK_URL ||
    'https://santhoshp.app.n8n.cloud/webhook/registration-confirmation';

  if (n8nWebhookUrl) {
    // Look up the event details for the webhook payload
    const event = INITIAL_EVENTS.find((e) => e.id === body.eventId);

    const extractedEmail =
      body.email ||
      body.customResponses?.f_email ||
      body.customResponses?.email ||
      '';

    const extractedName =
      body.studentName ||
      body.name ||
      body.customResponses?.f_name ||
      'Registered Student';

    const agendaList = body.agenda || event?.agenda || [];

    // 1. Plain-text slot-by-slot agenda with double line-breaks
    const eventAgendaText =
      Array.isArray(agendaList) && agendaList.length > 0
        ? agendaList
            .map((item: any) => {
              if (typeof item === 'string') return `• ${item}`;
              const time = item.time ? `• ${item.time}: ` : '• ';
              const title = item.activity || item.title || item.name || 'Session';
              const venue = item.venue ? `\n  (${item.venue})` : '';
              return `${time}${title}${venue}`;
            })
            .join('\n\n')
        : 'Agenda timetable will be shared prior to event.';

    // 2. Structured HTML slot-by-slot agenda with styling, bold times, and venue subtext
    const eventAgendaHtml =
      Array.isArray(agendaList) && agendaList.length > 0
        ? agendaList
            .map((item: any) => {
              if (typeof item === 'string') {
                return `<div style="margin-bottom: 16px;">• ${item}</div>`;
              }
              const time = item.time ? `<strong>• ${item.time}:</strong> ` : '<strong>• </strong>';
              const title = item.activity || item.title || item.name || 'Session';
              const venue = item.venue
                ? `<br/><span style="color: #94a3b8; font-size: 13px; margin-left: 18px;"><em>(${item.venue})</em></span>`
                : '';
              return `<div style="margin-bottom: 16px; line-height: 1.6;">${time}${title}${venue}</div>`;
            })
            .join('')
        : '<div>Agenda timetable will be shared prior to event.</div>';

    // 3. Multi-mode formatted agenda that renders slot-by-slot in both HTML and Text Gmail nodes
    const formattedAgendaSlotBySlot =
      Array.isArray(agendaList) && agendaList.length > 0
        ? '<br/><br/>\n\n' +
          agendaList
            .map((item: any) => {
              if (typeof item === 'string') return `• ${item}`;
              const time = item.time ? `• <strong>${item.time}:</strong> ` : '• ';
              const title = item.activity || item.title || item.name || 'Session';
              const venue = item.venue ? `<br/>&nbsp;&nbsp;<em>(${item.venue})</em>` : '';
              return `${time}${title}${venue}`;
            })
            .join('<br/><br/>\n\n') +
          '<br/><br/>\n\n'
        : 'Agenda timetable will be shared prior to event.';

    const eventTitle = event?.title || body.eventTitle || 'Event';
    const eventDate = event?.date || body.eventDate || '';
    const eventVenue = event?.venue || body.eventVenue || '';

    const webhookPayload = {
      name: extractedName,
      studentName: extractedName,
      email: extractedEmail,
      eventName: eventTitle,
      eventTitle: eventTitle,
      eventDate: eventDate,
      date: eventDate,
      eventVenue: eventVenue,
      venue: eventVenue,
      registrationId: registrationId,
      // Slot-by-slot formatted strings for {{ $json.agenda }}
      agenda: formattedAgendaSlotBySlot,
      agendaText: eventAgendaText,
      agendaSlotBySlot: formattedAgendaSlotBySlot,
      agendaSummary: eventAgendaText,
      agendaList: agendaList,
      agendaItems: agendaList,
      eventAgendaText: eventAgendaText,
      eventAgendaHtml: eventAgendaHtml,
      agendaHtml: eventAgendaHtml,
      // Full ready-to-use HTML & Text email bodies
      emailHtml: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6;">
          <p>Hello <strong>${extractedName}</strong>,</p>
          <p>Thank you for registering for <strong>${eventTitle}</strong>.</p>
          <p style="margin-top: 18px; margin-bottom: 12px; font-weight: bold; font-size: 15px;">📅 Here is the agenda for the event:</p>
          <div style="margin: 14px 0; padding: 12px 16px; background-color: #f8fafc; border-left: 3px solid #6366f1; border-radius: 8px;">
            ${eventAgendaHtml}
          </div>
          <p style="margin-top: 20px; line-height: 1.8;">
            <strong>Event Date:</strong> ${eventDate}<br/>
            <strong>Venue:</strong> ${eventVenue}
          </p>
          <p>Please arrive on time and follow the event schedule.</p>
          <p style="margin-top: 24px;">Regards,<br/><strong>AI Event Organiser Team</strong></p>
        </div>
      `.trim(),
      emailText: `Hello ${extractedName},\n\nThank you for registering for ${eventTitle}.\n\n📅 Here is the agenda for the event:\n\n${eventAgendaText}\n\nEvent Date: ${eventDate}\nVenue: ${eventVenue}\n\nPlease arrive on time and follow the event schedule.\n\nRegards,\nAI Event Organiser Team`,
    };

    console.log(`[Registration] Triggering n8n webhook at ${n8nWebhookUrl} with payload:`, webhookPayload);

    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      });

      if (n8nResponse.ok) {
        console.log(`[Registration] n8n notification sent successfully for registration: ${registrationId}`);
      } else {
        console.error(`[Registration] n8n notification failed with status ${n8nResponse.status} for registration: ${registrationId}`);
      }
    } catch (error: any) {
      console.error(`[Registration] n8n notification failed: ${error?.message || error}. Registration ${registrationId} remains successful.`);
    }
  }
  // --- End n8n Webhook ---

  return Response.json(
    {
      ok: true,
      status: 'accepted',
      registration,
      automationTopic: 'registration.created',
      automationWebhook: '/api/n8n/webhook/registration.created',
    },
    { status: 202 }
  );
}
