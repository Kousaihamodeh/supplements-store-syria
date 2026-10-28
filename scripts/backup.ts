import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const db = new PrismaClient();

async function backup() {
  const rootDir = process.cwd();
  const dbPath = path.join(rootDir, 'prisma', 'dev.db');
  const dbBakPath = path.join(rootDir, 'prisma', 'dev.db.bak');
  const uploadsDir = path.join(rootDir, 'public', 'uploads');
  const imagesDir = path.join(rootDir, 'public', 'images');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(rootDir, 'backups', `backup-${timestamp}`);
  const latestDir = path.join(rootDir, 'backups', 'latest');
  const autoLatestDir = path.join(rootDir, 'backups', 'auto-latest');

  fs.mkdirSync(backupDir, { recursive: true });
  fs.mkdirSync(latestDir, { recursive: true });
  fs.mkdirSync(autoLatestDir, { recursive: true });

  // 0. Flush SQLite WAL into main dev.db file before copying
  try {
    await db.$queryRawUnsafe('PRAGMA wal_checkpoint(TRUNCATE);');
  } catch {
    // Ignore if WAL is not active
  }

  // 1. Backup SQLite database file
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, dbBakPath);
    fs.copyFileSync(dbPath, path.join(backupDir, 'dev.db'));
    fs.copyFileSync(dbPath, path.join(latestDir, 'dev.db'));
    fs.copyFileSync(dbPath, path.join(autoLatestDir, 'dev.db'));
    console.log(`✅ Database backed up to: ${backupDir}/dev.db`);
  } else {
    console.log('⚠️ Database file not found yet.');
  }

  // 2. Backup Uploaded Images (public/uploads)
  if (fs.existsSync(uploadsDir)) {
    fs.cpSync(uploadsDir, path.join(backupDir, 'uploads'), { recursive: true });
    fs.cpSync(uploadsDir, path.join(latestDir, 'uploads'), { recursive: true });
    fs.cpSync(uploadsDir, path.join(autoLatestDir, 'uploads'), { recursive: true });
    console.log(`✅ Uploaded images backed up to: ${backupDir}/uploads`);
  }

  // 3. Backup Static Store Images (public/images)
  if (fs.existsSync(imagesDir)) {
    fs.cpSync(imagesDir, path.join(backupDir, 'images'), { recursive: true });
    fs.cpSync(imagesDir, path.join(latestDir, 'images'), { recursive: true });
  }

  // 4. Export full JSON snapshot of all database tables
  const [products, categories, brands, orders, shippingAreas, settings] = await Promise.all([
    db.product.findMany({
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        category: true,
        brand: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    db.brand.findMany(),
    db.order.findMany({ include: { items: true } }),
    db.shippingArea.findMany(),
    db.storeSettings.findMany(),
  ]);

  const snapshot = {
    exportedAt: new Date().toISOString(),
    counts: {
      products: products.length,
      categories: categories.length,
      brands: brands.length,
      orders: orders.length,
      shippingAreas: shippingAreas.length,
    },
    storeSettings: settings,
    categories,
    brands,
    products,
    shippingAreas,
    orders,
  };

  const jsonContent = JSON.stringify(snapshot, null, 2);
  fs.writeFileSync(path.join(backupDir, 'full-data-snapshot.json'), jsonContent, 'utf-8');
  fs.writeFileSync(path.join(latestDir, 'full-data-snapshot.json'), jsonContent, 'utf-8');
  fs.writeFileSync(path.join(autoLatestDir, 'full-data-snapshot.json'), jsonContent, 'utf-8');
  console.log(`✅ JSON snapshot (${products.length} products, ${categories.length} categories) saved!`);

  await db.$disconnect();
  console.log('🎉 Full backup completed successfully!');
}

backup().catch(async (err) => {
  console.error(err);
  await db.$disconnect();
  process.exit(1);
});
