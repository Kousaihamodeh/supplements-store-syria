import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const db = new PrismaClient();

function autoBackupSafe() {
  try {
    const rootDir = process.cwd();
    const dbPath = path.join(rootDir, 'prisma', 'dev.db');
    const dbBakPath = path.join(rootDir, 'prisma', 'dev.db.bak');
    const autoLatestDir = path.join(rootDir, 'backups', 'auto-latest');
    const uploadsDir = path.join(rootDir, 'public', 'uploads');

    fs.mkdirSync(autoLatestDir, { recursive: true });

    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, dbBakPath);
      fs.copyFileSync(dbPath, path.join(autoLatestDir, 'dev.db'));
    }

    if (fs.existsSync(uploadsDir)) {
      const targetUploads = path.join(autoLatestDir, 'uploads');
      fs.mkdirSync(targetUploads, { recursive: true });
      fs.cpSync(uploadsDir, targetUploads, { recursive: true });
    }
  } catch (error) {
    console.error('Auto backup sync error:', error);
  }
}

async function runPersistenceAudit() {
  console.log('🧪 Starting Automated Data Persistence Audit Test Suite...\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failedTests++;
    }
  }

  try {
    // Test 1: Verify Single Source of Truth (Database Connectivity)
    const storeSettings = await db.storeSettings.findUnique({ where: { id: 'default' } });
    assert(!!storeSettings, 'Database is active and accessible as Single Source of Truth');

    // Test 2: Category CRUD Operation
    const testCategorySlug = `audit-cat-${Date.now()}`;
    const testCategory = await db.category.create({
      data: {
        nameAr: 'تصنيف اختبار متقدم',
        nameEn: 'Audit Test Category',
        slug: testCategorySlug,
        descriptionAr: 'وصف تجريبي لاختبار الثبات',
        descriptionEn: 'Audit description',
      },
    });
    assert(!!testCategory.id, 'Category CREATE operation committed to Database');

    const fetchedCategory = await db.category.findUnique({ where: { id: testCategory.id } });
    assert(fetchedCategory?.nameAr === 'تصنيف اختبار متقدم', 'Category READ verified from Database');

    // Test 3: Product CREATE Operation (Atomic Data Structure)
    const testSku = `AUDIT-PROD-${Date.now()}`;
    const testProduct = await db.product.create({
      data: {
        nameAr: 'منتج اختبار الثبات النهائي',
        nameEn: 'Ultimate Audit Test Product',
        slug: `audit-prod-${Date.now()}`,
        descriptionAr: 'وصف المنتج للاختبار الحقيقي',
        descriptionEn: 'Real product description for audit',
        price: 500000,
        oldPrice: 550000,
        sku: testSku,
        stock: 20,
        categoryId: testCategory.id,
        isFeatured: true,
        images: {
          create: [
            { url: '/uploads/test-image-1.jpg', isMain: true, sortOrder: 0 },
            { url: '/uploads/test-image-2.jpg', isMain: false, sortOrder: 1 },
          ],
        },
        variants: {
          create: [
            { size: '1 KG', flavor: 'Chocolate', priceAdjustment: 0, stock: 10, sku: `${testSku}-CHOC` },
            { size: '2 KG', flavor: 'Vanilla', priceAdjustment: 50000, stock: 10, sku: `${testSku}-VAN` },
          ],
        },
      },
      include: {
        images: true,
        variants: true,
      },
    });

    assert(!!testProduct.id, 'Product CREATE operation committed to Database');
    assert(testProduct.images.length === 2, 'Product Images database relationship verified');
    assert(testProduct.variants.length === 2, 'Product Variants database relationship verified');

    // Test 4: Product UPDATE Operation
    const updatedProduct = await db.product.update({
      where: { id: testProduct.id },
      data: {
        price: 520000,
        nameAr: 'منتج اختبار الثبات المحدث',
      },
    });
    assert(updatedProduct.price === 520000, 'Product UPDATE operation persisted in Database');

    // Test 5: Product DUPLICATION Operation
    const duplicatedSku = `${testProduct.sku}-COPY`;
    const duplicatedProduct = await db.product.create({
      data: {
        nameAr: `${testProduct.nameAr} (نسخة)`,
        nameEn: `${testProduct.nameEn} (Copy)`,
        slug: `${testProduct.slug}-copy`,
        descriptionAr: testProduct.descriptionAr,
        descriptionEn: testProduct.descriptionEn,
        price: testProduct.price,
        oldPrice: testProduct.oldPrice,
        sku: duplicatedSku,
        stock: testProduct.stock,
        categoryId: testProduct.categoryId,
        images: {
          create: testProduct.images.map((img) => ({
            url: img.url,
            isMain: img.isMain,
            sortOrder: img.sortOrder,
          })),
        },
      },
      include: { images: true },
    });
    assert(!!duplicatedProduct.id && duplicatedProduct.sku === duplicatedSku, 'Product DUPLICATION operation verified');

    // Test 6: Order Creation & Inventory Decrement Transaction
    const testOrderNumber = `AUDIT-ORD-${Date.now()}`;
    const initialStock = updatedProduct.stock;
    const orderQuantity = 3;

    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: testOrderNumber,
          customerName: 'أحمد اختبار',
          customerPhone: '0938229497',
          governorate: 'دمشق',
          cityArea: 'جرمانا',
          address: 'ساحة الكرامة',
          subtotal: updatedProduct.price * orderQuantity,
          shippingFee: 15000,
          total: (updatedProduct.price * orderQuantity) + 15000,
          status: 'NEW',
          items: {
            create: [
              {
                productId: updatedProduct.id,
                productNameAr: updatedProduct.nameAr,
                productNameEn: updatedProduct.nameEn,
                price: updatedProduct.price,
                quantity: orderQuantity,
              },
            ],
          },
        },
      });

      await tx.product.update({
        where: { id: updatedProduct.id },
        data: { stock: { decrement: orderQuantity } },
      });

      return newOrder;
    });

    assert(!!order.id, 'Order CREATE committed atomically via Database Transaction');

    const productAfterOrder = await db.product.findUnique({ where: { id: updatedProduct.id } });
    assert(
      productAfterOrder?.stock === initialStock - orderQuantity,
      `Inventory stock atomically decremented from ${initialStock} to ${productAfterOrder?.stock}`
    );

    // Test 7: Store Settings Update (preserve & restore real URL)
    const realMapsUrl =
      storeSettings?.googleMapsUrl && !storeSettings.googleMapsUrl.includes('Audit%20Test%20Store')
        ? storeSettings.googleMapsUrl
        : 'https://maps.google.com/?q=33.488506,36.340218';

    const updatedSettings = await db.storeSettings.update({
      where: { id: 'default' },
      data: {
        googleMapsUrl: realMapsUrl,
      },
    });
    assert(
      updatedSettings.googleMapsUrl === realMapsUrl,
      'Store Settings Google Maps URL update persisted in Database'
    );

    // Clean up test records BEFORE running auto-backup
    await db.order.delete({ where: { id: order.id } });
    await db.product.delete({ where: { id: testProduct.id } });
    await db.product.delete({ where: { id: duplicatedProduct.id } });
    await db.category.delete({ where: { id: testCategory.id } });

    // Test 8: Auto-Backup System
    autoBackupSafe();
    const backupDbExists = fs.existsSync(path.join(process.cwd(), 'prisma', 'dev.db.bak'));
    assert(backupDbExists, 'Auto-Backup mirror file dev.db.bak created successfully');

    console.log('\n----------------------------------------');
    console.log(`📊 Audit Results: ${passedTests} Passed | ${failedTests} Failed`);
    console.log('----------------------------------------\n');

    if (failedTests === 0) {
      console.log('🎉 ALL DATA PERSISTENCE AUDIT TESTS PASSED SUCCESSFULLY!');
    } else {
      console.error('❌ SOME AUDIT TESTS FAILED. CHECK LOGS.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Audit execution failure:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

runPersistenceAudit();
