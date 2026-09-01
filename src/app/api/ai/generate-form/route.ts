import { generateFormFields } from '@/server/ai';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return Response.json(await generateFormFields(body));
}
