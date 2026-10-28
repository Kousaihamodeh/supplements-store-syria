import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { getAdminFromCookies } from '@/lib/auth';
import { autoBackupSafe } from '@/lib/backup-helper';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    for (const file of files) {
      if (typeof file === 'string') continue;

      // 1. File Size Validation
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `حجم الملف ${file.name} يتجاوز الحد الأقصى المسموح (5 ميغابايت)` },
          { status: 400 }
        );
      }

      // 2. Extension & MIME Type Validation (Strict whitelist, NO SVG / HTML / Executables)
      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `نوع الملف ${file.name} غير مدعوم. المسموح فقط (JPG, PNG, WEBP, GIF)` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 3. Path Traversal & Filename Sanitization
      const safeRandomName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(uploadDir, path.basename(safeRandomName));

      await writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/${safeRandomName}`);
    }

    autoBackupSafe();

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
  }
}
