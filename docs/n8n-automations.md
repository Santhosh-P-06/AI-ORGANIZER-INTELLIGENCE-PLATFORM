# n8n Automation Guide

The app now exposes stable Node.js API routes through Next.js route handlers. n8n can call these routes directly, and the platform can receive n8n callbacks through one generic webhook receiver.

## Required environment

Set these in `.env.local`:

```env
APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
N8N_BASE_URL="https://santhoshp.app.n8n.cloud"
N8N_WEBHOOK_SECRET="change_me"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_event_organiser"
```

## Incoming n8n webhook pattern

```http
POST /api/n8n/webhook/{topic}
x-n8n-secret: change_me
content-type: application/json
```

Recommended topics:

- `registration.created`
- `attendance.recorded`
- `attendance.absent`
- `allocation.published`
- `certificate.generated`

The API stores receipts in `n8n_webhook_events` when PostgreSQL is configured. If the database is not configured yet, the endpoint still returns a receipt so workflows can be tested.

## Useful API routes

- `GET /api/health` checks stack, AI, database, and n8n configuration.
- `GET /api/n8n/blueprints` returns automation topics and sample payloads.
- `GET /api/events` returns event data for n8n or Flutter.
- `GET /api/registrations?eventId=evt_technohack_2026` returns registrations for an event.
- `POST /api/ai/generate-form` creates event-specific registration fields.
- `POST /api/ai/generate-agenda` creates an agenda timeline.
- `POST /api/ai/allocate-panels` generates panel allocations.
- `POST /api/ai/event-insights` generates operational recommendations.
- `POST /api/ai/assistant-chat` answers event operation questions.

## Automation ideas

1. Registration confirmation: trigger on `registration.created`, send email/WhatsApp, add row to Google Sheets, notify organiser.
2. QR attendance: trigger on `attendance.recorded`, update sheet, send room instructions, mark late arrivals.
3. Absence handling: trigger on `attendance.absent`, alert coordinator, ask for replacement, update team eligibility.
4. Panel allocation: trigger on `allocation.published`, message team leads with panel, room, and slot.
5. Certificate dispatch: trigger on `certificate.generated`, email certificate, upload PDF to Drive, call back with delivery receipt.
6. Post-event report: scheduled n8n workflow calls `/api/ai/event-insights`, builds a summary, sends it to faculty.
