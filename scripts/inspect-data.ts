import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const db = new PrismaClient();

async function inspectAndSnapshot() {
  console.log('🔍 Inspecting Database & Assets...\n');

  const [products, categories, brands, orders, shippingAreas, settings, admins] = await Promise.all([
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
    db.admin.findMany({ select: { id: true, username: true, email: true, role: true } }),
  ]);

  console.log(`📦 Total Products: ${products.length}`);
  console.log(`📂 Total Categories: ${categories.length}`);
  console.log(`🏷️ Total Brands: ${brands.length}`);
  console.log(`🛒 Total Orders: ${orders.length}`);
  console.log(`🚚 Total Shipping Areas: ${shippingAreas.length}`);

  console.log('\n--- PRODUCT LIST ---');
  let totalImagesInDb = 0;
  let totalVariantsInDb = 0;
  let missingLocalImages: string[] = [];

  for (const [idx, p] of products.entries()) {
    totalImagesInDb += p.images.length;
    totalVariantsInDb += p.variants.length;
    console.log(
      `${idx + 1}. [${p.sku}] ${p.nameAr} | ${p.nameEn} — Price: ${p.price} $ | Stock: ${p.stock} | Category: ${p.category?.nameAr} | Images: ${p.images.length} | Variants: ${p.variants.length} | Active: ${p.isActive}`
    );
    for (const img of p.images) {
      if (img.url.startsWith('/')) {
        const localFile = path.join(process.cwd(), 'public', img.url);
        const exists = fs.existsSync(localFile);
        if (!exists) {
          missingLocalImages.push(`Product "${p.nameAr}" (${p.id}): ${img.url}`);
        }
      }
    }
  }

  console.log('\n--- CATEGORY LIST ---');
  for (const [idx, c] of categories.entries()) {
    console.log(`${idx + 1}. [${c.slug}] ${c.nameAr} | ${c.nameEn} — Image: ${c.image || 'None'}`);
    if (c.image && c.image.startsWith('/')) {
      const localFile = path.join(process.cwd(), 'public', c.image);
      if (!fs.existsSync(localFile)) {
        missingLocalImages.push(`Category "${c.nameAr}" (${c.id}): ${c.image}`);
      }
    }
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const uploadedFiles = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
  console.log(`\n🖼️ Total Product Images in DB: ${totalImagesInDb}`);
  console.log(`🎨 Total Product Variants in DB: ${totalVariantsInDb}`);
  console.log(`📁 Files in public/uploads: ${uploadedFiles.length}`);
  if (missingLocalImages.length > 0) {
    console.warn(`⚠️ Missing Local Image Files (${missingLocalImages.length}):`, missingLocalImages);
  } else {
    console.log(`✅ All local image paths in DB exist on disk!`);
  }

  // Save JSON snapshot to backups/latest/full-data-snapshot.json
  const snapshot = {
    exportedAt: new Date().toISOString(),
    counts: {
      products: products.length,
      categories: categories.length,
      brands: brands.length,
      orders: orders.length,
      shippingAreas: shippingAreas.length,
      productImages: totalImagesInDb,
      productVariants: totalVariantsInDb,
      uploadedFilesOnDisk: uploadedFiles.length,
    },
    storeSettings: settings,
    categories,
    brands,
    products,
    shippingAreas,
    orders,
  };

  const latestDir = path.join(process.cwd(), 'backups', 'latest');
  fs.mkdirSync(latestDir, { recursive: true });
  const snapshotPath = path.join(latestDir, 'full-data-snapshot.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf-8');
  console.log(`\n💾 Saved complete JSON data snapshot to: ${snapshotPath}`);

  await db.$disconnect();
}

inspectAndSnapshot().catch((e) => {
  console.error(e);
  process.exit(1);
});
