import fs from 'fs';
import path from 'path';

async function restore() {
  const rootDir = process.cwd();
  const latestDir = path.join(rootDir, 'backups', 'latest');
  const targetDbPath = path.join(rootDir, 'prisma', 'dev.db');
  const targetUploadsDir = path.join(rootDir, 'public', 'uploads');

  const latestDbPath = path.join(latestDir, 'dev.db');
  const latestUploadsDir = path.join(latestDir, 'uploads');

  if (!fs.existsSync(latestDbPath)) {
    console.error('❌ No backup found in backups/latest/dev.db');
    process.exit(1);
  }

  // Restore DB
  fs.copyFileSync(latestDbPath, targetDbPath);
  console.log('✅ Restored database from backups/latest/dev.db');

  // Restore Uploads
  if (fs.existsSync(latestUploadsDir)) {
    fs.mkdirSync(targetUploadsDir, { recursive: true });
    fs.cpSync(latestUploadsDir, targetUploadsDir, { recursive: true });
    console.log('✅ Restored uploads from backups/latest/uploads');
  }

  console.log('🎉 Restore completed successfully!');
}

restore().catch(console.error);
