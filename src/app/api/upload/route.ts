import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getAdminFromCookies } from '@/lib/auth';
import { autoBackupSafe } from '@/lib/backup-helper';

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.jfif',
  '.bmp',
  '.svg',
  '.avif',
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json(
        { error: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول إلى لوحة التحكم مجدداً' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'لم يتم اختيار أي ملف للرفع' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file || typeof file === 'string') continue;

      // 1. File Size Validation
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `حجم الصورة ${file.name} كبير جداً (أكبر من 15 ميغابايت)` },
          { status: 400 }
        );
      }

      // 2. Determine file extension
      let ext = path.extname(file.name || '').toLowerCase();
      if (!ext || ext.length < 2) {
        if (file.type === 'image/png') ext = '.png';
        else if (file.type === 'image/webp') ext = '.webp';
        else if (file.type === 'image/gif') ext = '.gif';
        else ext = '.jpg';
      }

      // Validate allowed image types
      if (!ALLOWED_EXTENSIONS.has(ext) && !file.type?.startsWith('image/')) {
        return NextResponse.json(
          { error: `نوع الملف ${file.name} غير مدعوم. المسموح فقط صور (JPG, PNG, WEBP, GIF)` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      let savedUrl = '';
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });
        const safeRandomName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        const filePath = path.join(uploadDir, safeRandomName);
        await writeFile(filePath, buffer);
        savedUrl = `/uploads/${safeRandomName}`;
      } catch (fsErr) {
        // Fallback for Vercel serverless / read-only environment:
        // Return Data URL so image upload NEVER fails and renders everywhere!
        const mime = file.type || 'image/jpeg';
        savedUrl = `data:${mime};base64,${buffer.toString('base64')}`;
      }

      uploadedUrls.push(savedUrl);
    }

    try {
      autoBackupSafe();
    } catch (e) {
      // Ignore backup error on serverless environments
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'حدث خطأ غير متوقع أثناء معالجة الصورة' },
      { status: 500 }
    );
  }
}
