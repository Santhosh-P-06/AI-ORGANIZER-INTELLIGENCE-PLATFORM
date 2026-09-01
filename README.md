# AI Event Organiser Intelligence Platform

A collegiate event operating system aligned to the required stack:

- Frontend: Next.js App Router
- Backend: Node.js route handlers for APIs, event processing, and AI services
- Database: PostgreSQL
- Mobile: Flutter cross-platform scaffold
- UI/UX: Figma handoff notes
- Automation: n8n webhook topics and workflow starter

## Main Features

- Organiser, student, volunteer, and admin dashboards
- AI-generated registration forms and agendas
- Random/conflict-free panel allocation
- QR attendance and live monitoring workflows
- Certificate generation, verification, and dispatch flows
- Analytics and AI recommendations
- n8n webhook endpoints and workflow starter

## Run Locally

Prerequisites: Node.js and PostgreSQL.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Create `.env.local` from `.env.example`, then set:

```env
GEMINI_API_KEY="MY_GEMINI_API_KEY"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_event_organiser"
APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
N8N_BASE_URL="https://santhoshp.app.n8n.cloud"
N8N_WEBHOOK_SECRET="change_me"
```

## PostgreSQL

Apply the starter schema:

```bash
psql "$DATABASE_URL" -f database/schema.sql
```

The app still includes local demo data for the UI, while the backend schema is ready for persisted users, events, registrations, certificates, audit logs, notifications, n8n receipts, and automation runs.

## n8n Automations

- Use `GET /api/n8n/blueprints` for topics and sample payloads.
- Import `n8n/workflows/event-automation-starter.json` into n8n as a starting workflow.
- See `docs/n8n-automations.md` for endpoint details and automation ideas.

## Flutter

The Flutter companion app lives in `mobile/flutter_app` and reads the Next.js REST API.

```bash
cd mobile/flutter_app
flutter pub get
flutter run --dart-define=API_BASE_URL=http://localhost:3000
```
