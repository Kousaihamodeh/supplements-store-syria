import fs from 'fs';
import path from 'path';

export function autoBackupSafe() {
  try {
    const rootDir = process.cwd();
    const dbPath = path.join(rootDir, 'prisma', 'dev.db');
    const dbBakPath = path.join(rootDir, 'prisma', 'dev.db.bak');
    const autoLatestDir = path.join(rootDir, 'backups', 'auto-latest');
    const uploadsDir = path.join(rootDir, 'public', 'uploads');

    fs.mkdirSync(autoLatestDir, { recursive: true });

    // 1. Instantly mirror dev.db (and WAL if active) to dev.db.bak & auto-latest
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, dbBakPath);
      fs.copyFileSync(dbPath, path.join(autoLatestDir, 'dev.db'));
      const walPath = `${dbPath}-wal`;
      if (fs.existsSync(walPath)) {
        fs.copyFileSync(walPath, `${dbBakPath}-wal`);
        fs.copyFileSync(walPath, path.join(autoLatestDir, 'dev.db-wal'));
      }
    }

    // 2. Instantly mirror uploaded images
    if (fs.existsSync(uploadsDir)) {
      const targetUploads = path.join(autoLatestDir, 'uploads');
      fs.mkdirSync(targetUploads, { recursive: true });
      fs.cpSync(uploadsDir, targetUploads, { recursive: true });
    }
  } catch (error) {
    console.error('Auto backup sync error:', error);
  }
}

export function autoRecoverOnStartup() {
  try {
    const rootDir = process.cwd();
    const dbPath = path.join(rootDir, 'prisma', 'dev.db');
    const dbBakPath = path.join(rootDir, 'prisma', 'dev.db.bak');
    const autoLatestDb = path.join(rootDir, 'backups', 'auto-latest', 'dev.db');

    if (!fs.existsSync(dbPath)) {
      if (fs.existsSync(dbBakPath)) {
        fs.copyFileSync(dbBakPath, dbPath);
        console.log('🛡️ Auto-recovered missing database from dev.db.bak!');
      } else if (fs.existsSync(autoLatestDb)) {
        fs.copyFileSync(autoLatestDb, dbPath);
        console.log('🛡️ Auto-recovered missing database from backups/auto-latest/dev.db!');
      }
    }
  } catch (error) {
    console.error('Auto recovery error:', error);
  }
}
