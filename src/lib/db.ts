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
        ];
        for (const src of candidatePaths) {
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, tmpDbPath);
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

// Configure SQLite WAL mode and busy_timeout for high concurrency & non-blocking writes
if (!globalForPrisma.prisma) {
  db.$queryRawUnsafe('PRAGMA journal_mode = WAL;')
    .then(() => db.$queryRawUnsafe('PRAGMA busy_timeout = 15000;'))
    .catch((err) => console.error('Pragma WAL setup error:', err));
  globalForPrisma.prisma = db;
}
