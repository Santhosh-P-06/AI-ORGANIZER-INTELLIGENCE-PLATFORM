import { INITIAL_EVENTS } from '@/data/initialData';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = INITIAL_EVENTS.find((item) => item.id === id);

  if (!event) {
    return Response.json({ error: 'Event not found' }, { status: 404 });
  }

  return Response.json({ event });
}
