import { INITIAL_EVENTS, INITIAL_REGISTRATIONS } from '@/data/initialData';
import { PanelAllocation } from '@/types';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { eventId, allocations = [], registrations = [] } = body;

  if (!eventId) {
    return Response.json({ ok: false, error: 'eventId is required' }, { status: 400 });
  }

  // 1. Look up event information
  const event = INITIAL_EVENTS.find((e) => e.id === eventId);
  const eventName = event?.title || body.eventTitle || 'Collegiate AI Event';

  // Combined registrations list (from payload or initialData fallback)
  const allRegistrations = Array.isArray(registrations) && registrations.length > 0
    ? registrations
    : INITIAL_REGISTRATIONS;

  const webhookUrl =
    process.env.N8N_PANEL_ALLOCATION_WEBHOOK_URL ||
    'https://santhoshp.app.n8n.cloud/webhook/panel-allocation';

  console.log(`[PanelAllocation] Publishing ${allocations.length} allocations for event: ${eventName}`);

  const results = [];

  // 2. Iterate through each allocated team/participant
  for (const allocation of allocations as PanelAllocation[]) {
    // Find matching registration to obtain participant email & name
    const reg = allRegistrations.find(
      (r: any) =>
        r.eventId === eventId &&
        (r.rollNumber?.toLowerCase() === allocation.leadRollNo?.toLowerCase() ||
         r.teamName?.toLowerCase() === allocation.teamName?.toLowerCase() ||
         r.studentName?.toLowerCase() === allocation.leadStudentName?.toLowerCase())
    );

    const participantName = allocation.leadStudentName || reg?.studentName || 'Participant';
    const participantEmail = reg?.email || `${allocation.leadRollNo?.toLowerCase() || 'student'}@college.edu`;
    const panel = allocation.panelName || 'Panel Jury';
    const panelVenue = allocation.room || 'Main Hall';
    const reportingTime = allocation.timeSlot || '09:30 AM';

    const payload = {
      name: participantName,
      studentName: participantName,
      leadStudentName: participantName,
      email: participantEmail,
      teamName: allocation.teamName || '',
      eventName: eventName,
      eventTitle: eventName,
      panel: panel,
      panelName: panel,
      panelVenue: panelVenue,
      room: panelVenue,
      reportingTime: reportingTime,
      timeSlot: reportingTime,
    };

    console.log(`[PanelAllocation] Sending payload to n8n for ${participantName} (${participantEmail}):`, payload);

    let n8nSuccess = false;
    let n8nError = null;

    // 3. Send POST request to n8n webhook (Non-blocking per item)
    try {
      const n8nRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (n8nRes.ok) {
        n8nSuccess = true;
        console.log(`[PanelAllocation] n8n webhook succeeded for ${participantEmail}`);
      } else {
        n8nError = `n8n responded with status ${n8nRes.status}`;
        console.error(`[PanelAllocation] n8n webhook failed for ${participantEmail}: ${n8nError}`);
      }
    } catch (err: any) {
      n8nError = err?.message || 'Failed to reach n8n server';
      console.error(`[PanelAllocation] n8n request failed for ${participantEmail}: ${n8nError}. Panel allocation remains successful.`);
    }

    results.push({
      teamName: allocation.teamName,
      leadStudentName: participantName,
      email: participantEmail,
      n8nSuccess,
      n8nError,
    });
  }

  return Response.json({
    ok: true,
    message: 'Panel allocations published successfully',
    eventId,
    totalAllocated: allocations.length,
    results,
  });
}
