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
  // Default to localhost webhook if environment variable is not defined
  const n8nWebhookUrl =
    process.env.N8N_REGISTRATION_WEBHOOK_URL ||
    'http://localhost:5678/webhook/registration-confirmation';

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
    const eventAgendaText =
      Array.isArray(agendaList) && agendaList.length > 0
        ? agendaList
            .map(
              (item: any) =>
                `• ${item.time}: ${item.activity}${item.venue ? ` (${item.venue})` : ''}`
            )
            .join('\n')
        : 'Agenda timetable will be shared prior to event.';

    const eventAgendaHtml =
      Array.isArray(agendaList) && agendaList.length > 0
        ? `<ul style="margin: 5px 0; padding-left: 20px;">` +
          agendaList
            .map(
              (item: any) =>
                `<li style="margin-bottom: 4px;"><strong>${item.time}:</strong> ${item.activity}${item.venue ? ` <em>(${item.venue})</em>` : ''}</li>`
            )
            .join('') +
          `</ul>`
        : 'Agenda timetable will be shared prior to event.';

    const webhookPayload = {
      name: extractedName,
      email: extractedEmail,
      eventName: event?.title || body.eventTitle || '',
      eventDate: event?.date || body.eventDate || '',
      eventVenue: event?.venue || body.eventVenue || '',
      registrationId: registrationId,
      agenda: agendaList,
      eventAgendaText: eventAgendaText,
      eventAgendaHtml: eventAgendaHtml,
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
