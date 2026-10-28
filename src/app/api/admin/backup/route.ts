import { NextResponse } from 'next/server';
import { getAdminFromCookies } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rootDir = process.cwd();
    const dbPath = path.join(rootDir, 'prisma', 'dev.db');
    const uploadsDir = path.join(rootDir, 'public', 'uploads');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(rootDir, 'backups', `backup-${timestamp}`);
    const latestDir = path.join(rootDir, 'backups', 'latest');

    fs.mkdirSync(backupDir, { recursive: true });
    fs.mkdirSync(latestDir, { recursive: true });

    // 1. Copy DB
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, path.join(backupDir, 'dev.db'));
      fs.copyFileSync(dbPath, path.join(latestDir, 'dev.db'));
    }

    // 2. Copy Uploads
    if (fs.existsSync(uploadsDir)) {
      fs.cpSync(uploadsDir, path.join(backupDir, 'uploads'), { recursive: true });
      fs.cpSync(uploadsDir, path.join(latestDir, 'uploads'), { recursive: true });
    }

    return NextResponse.json({
      success: true,
      message: 'تم أخذ النسخة الاحتياطية بنجاح!',
      backupPath: `backups/backup-${timestamp}`,
    });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'فشل في إنشاء النسخة الاحتياطية' }, { status: 500 });
  }
}
