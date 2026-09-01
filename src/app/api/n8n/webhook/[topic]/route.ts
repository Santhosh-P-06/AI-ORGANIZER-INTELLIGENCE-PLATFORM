import { recordAutomationEvent } from '@/server/db';

function publicHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, x-n8n-secret',
  };
}

function sanitizeHeaders(headers: Headers) {
  const allowed = ['content-type', 'user-agent', 'x-n8n-workflow-id', 'x-n8n-execution-id'];
  return Object.fromEntries(
    Array.from(headers.entries()).filter(([key]) => allowed.includes(key.toLowerCase()))
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: publicHeaders() });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ topic: string }> }
) {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  const providedSecret = request.headers.get('x-n8n-secret');

  if (secret && providedSecret !== secret) {
    return Response.json({ ok: false, error: 'Invalid n8n secret' }, { status: 401, headers: publicHeaders() });
  }

  const { topic } = await params;
  const payload = await request.json().catch(() => ({}));
  const receipt = await recordAutomationEvent({
    topic,
    payload,
    source: 'n8n',
    headers: sanitizeHeaders(request.headers),
  });

  return Response.json(
    {
      ok: true,
      topic,
      receipt,
      next: {
        health: '/api/health',
        blueprints: '/api/n8n/blueprints',
        events: '/api/events',
      },
    },
    { headers: publicHeaders() }
  );
}
