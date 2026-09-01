import { INITIAL_REGISTRATIONS } from '@/data/initialData';

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

  return Response.json(
    {
      ok: true,
      status: 'accepted',
      registration: {
        id: body.id || `reg_${Date.now()}`,
        ...body,
      },
      automationTopic: 'registration.created',
      automationWebhook: '/api/n8n/webhook/registration.created',
    },
    { status: 202 }
  );
}
