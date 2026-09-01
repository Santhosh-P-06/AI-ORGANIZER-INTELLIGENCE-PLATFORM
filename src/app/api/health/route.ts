import { isDatabaseConfigured } from '@/server/db';

export async function GET() {
  return Response.json({
    status: 'ok',
    stack: {
      frontend: 'Next.js',
      backend: 'Node.js route handlers',
      database: 'PostgreSQL',
      mobile: 'Flutter-ready REST API',
      automation: 'n8n webhook endpoints',
    },
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    databaseConfigured: isDatabaseConfigured(),
    n8nConfigured: Boolean(process.env.N8N_WEBHOOK_SECRET),
    timestamp: new Date().toISOString(),
  });
}
