import { INITIAL_EVENTS } from '@/data/initialData';

export async function GET() {
  return Response.json({ events: INITIAL_EVENTS });
}
