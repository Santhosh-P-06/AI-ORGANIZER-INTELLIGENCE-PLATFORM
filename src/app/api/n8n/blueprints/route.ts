import { automationBlueprints } from '@/server/automation-blueprints';

export async function GET() {
  return Response.json({
    blueprints: automationBlueprints,
    authHeader: 'x-n8n-secret',
    callbackPattern: '/api/n8n/webhook/{topic}',
  });
}
