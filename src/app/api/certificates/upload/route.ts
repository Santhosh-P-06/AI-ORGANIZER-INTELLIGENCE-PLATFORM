import { saveCertificateFile } from '@/server/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return Response.json({ ok: false, error: 'No files provided' }, { status: 400 });
    }

    const appBaseUrl =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get('origin') ||
      'http://localhost:3000';

    const uploadedFiles: Array<{
      fileName: string;
      fileKey: string;
      fileUrl: string;
      size: number;
      expiresAt: number;
    }> = [];

    const rejectedFiles: Array<{
      fileName: string;
      reason: string;
    }> = [];

    for (const file of files) {
      // 1. Validate file format
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        rejectedFiles.push({
          fileName: file.name,
          reason: 'Only PDF files are supported',
        });
        continue;
      }

      // 2. Validate file size (25MB limit)
      if (file.size > 25 * 1024 * 1024) {
        rejectedFiles.push({
          fileName: file.name,
          reason: 'File exceeds 25MB maximum size limit',
        });
        continue;
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const saved = await saveCertificateFile(buffer, file.name, appBaseUrl);

      uploadedFiles.push({
        fileName: file.name,
        fileKey: saved.fileKey,
        fileUrl: saved.downloadUrl,
        size: saved.size,
        expiresAt: saved.expiresAt,
      });
    }

    return Response.json({
      ok: true,
      uploadedCount: uploadedFiles.length,
      rejectedCount: rejectedFiles.length,
      uploadedFiles,
      rejectedFiles,
    });
  } catch (error: any) {
    console.error('[Certificate Upload Error]:', error);
    return Response.json(
      { ok: false, error: error?.message || 'Failed to upload certificate files' },
      { status: 500 }
    );
  }
}
