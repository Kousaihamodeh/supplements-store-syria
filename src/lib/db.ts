import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { autoRecoverOnStartup } from './backup-helper';

function resolveDatabaseUrl(): string {
  // On Vercel serverless environment, copy bundled prisma/dev.db to writable /tmp/dev.db
  if (process.env.VERCEL) {
    try {
      const tmpDbPath = '/tmp/dev.db';
      if (!fs.existsSync(tmpDbPath)) {
        const candidatePaths = [
          path.join(process.cwd(), 'prisma', 'dev.db'),
          path.join(process.cwd(), 'dev.db'),
          path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
          path.join(__dirname, '..', 'prisma', 'dev.db'),
          path.join(__dirname, 'prisma', 'dev.db'),
          '/var/task/prisma/dev.db',
          '/var/task/dev.db',
        ];

        for (const src of candidatePaths) {
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, tmpDbPath);
            try {
              fs.chmodSync(tmpDbPath, 0o666);
            } catch (e) {}
            break;
          }
        }
      }

      if (fs.existsSync(tmpDbPath)) {
        return `file:${tmpDbPath}`;
      }
    } catch (err) {
      console.error('Vercel /tmp database setup warning:', err);
    }
  }

  // Local environment: ensure database file is automatically restored if accidentally deleted
  autoRecoverOnStartup();
  return process.env.DATABASE_URL || 'file:./dev.db';
}

const resolvedUrl = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (!globalForPrisma.prisma) {
  // Use busy_timeout so SQLite waits up to 15s instead of throwing SQLITE_BUSY
  db.$queryRawUnsafe('PRAGMA busy_timeout = 15000;')
    .catch((err) => console.error('Pragma busy_timeout setup error:', err));
  globalForPrisma.prisma = db;
}
