import { verifySignedToken, getCertificateFile } from '@/server/storage';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return new Response('Missing download token', { status: 400 });
    }

    const verification = verifySignedToken(token);
    if (!verification.valid || !verification.fileKey) {
      return new Response(verification.error || 'Unauthorized or expired download link', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const file = await getCertificateFile(verification.fileKey);
    if (!file) {
      return new Response('File not found or has been purged from temporary storage', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const safeFileName = encodeURIComponent(verification.fileName || 'certificate.pdf');

    return new Response(file.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': file.buffer.length.toString(),
        'Content-Disposition': `attachment; filename="${safeFileName}"; filename*=UTF-8''${safeFileName}`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[Certificate Download Error]:', error);
    return new Response('Internal Server Error while downloading certificate', { status: 500 });
  }
}
