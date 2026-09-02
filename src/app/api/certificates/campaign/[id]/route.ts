import { getCampaign } from '@/server/campaigns';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json({ ok: false, error: 'Campaign ID is required' }, { status: 400 });
    }

    const campaign = await getCampaign(id);
    if (!campaign) {
      return Response.json({ ok: false, error: 'Campaign not found' }, { status: 404 });
    }

    return Response.json({
      ok: true,
      campaign,
    });
  } catch (error: any) {
    return Response.json({ ok: false, error: error?.message || 'Failed to fetch campaign' }, { status: 500 });
  }
}
