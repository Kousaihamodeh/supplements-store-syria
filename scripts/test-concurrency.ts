import { PrismaClient } from '@prisma/client';
import path from 'path';

const db = new PrismaClient();

async function runConcurrencyTestSuite() {
  console.log('⚡ Starting Comprehensive SQLite & Prisma Concurrency Load Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 0. Enable WAL mode & busy_timeout for SQLite
    await db.$queryRawUnsafe('PRAGMA journal_mode = WAL;');
    await db.$queryRawUnsafe('PRAGMA busy_timeout = 15000;');

    // Setup Test Product with Known Stock
    const testCategory = await db.category.upsert({
      where: { slug: 'concurrency-test-cat' },
      update: {},
      create: {
        nameAr: 'قسم اختبار التزامن',
        nameEn: 'Concurrency Test Category',
        slug: 'concurrency-test-cat',
      },
    });

    const testProdSku = `CONCUR-${Date.now()}`;
    const INITIAL_TEST_STOCK = 50;
    const testProduct = await db.product.create({
      data: {
        nameAr: 'منتج اختبار التزامن والحمل',
        nameEn: 'Concurrency Test Product',
        slug: `concurrency-test-prod-${Date.now()}`,
        descriptionAr: 'منتج للاختبار المباشر تحت ضغط الطلبات',
        descriptionEn: 'Product for direct concurrency load testing',
        price: 100,
        sku: testProdSku,
        stock: INITIAL_TEST_STOCK,
        categoryId: testCategory.id,
      },
    });

    // ---------------------------------------------------------
    // TEST 1: 3 Concurrent Users Browsing & Ordering
    // ---------------------------------------------------------
    console.log('🧪 TEST 1: Simulating 3 Concurrent Users (Browsing & Checkout)...');
    const startTime3 = Date.now();

    // 3 concurrent read requests
    const readResults3 = await Promise.all([
      db.product.findMany({ take: 10 }),
      db.category.findMany(),
      db.storeSettings.findUnique({ where: { id: 'default' } }),
    ]);
    assert(readResults3.length === 3, '3 Concurrent Users: Simultaneous reads completed without locking');

    // 3 concurrent write transactions at exact same millisecond
    const orders3 = await Promise.all(
      [1, 2, 3].map((userNum) =>
        db.$transaction(
          async (tx) => {
            const updated = await tx.product.updateMany({
              where: { id: testProduct.id, stock: { gte: 1 } },
              data: { stock: { decrement: 1 } },
            });
            if (updated.count === 0) throw new Error('INSUFFICIENT_STOCK');

            return tx.order.create({
              data: {
                orderNumber: `ORD-3USER-${userNum}-${Date.now()}`,
                customerName: `زبون تزامن ${userNum}`,
                customerPhone: '0938229497',
                governorate: 'دمشق',
                cityArea: 'جرمانا',
                address: 'شارع التزامن',
                subtotal: 100,
                shippingFee: 10,
                total: 110,
                status: 'NEW',
                items: {
                  create: [
                    {
                      productId: testProduct.id,
                      productNameAr: testProduct.nameAr,
                      productNameEn: testProduct.nameEn,
                      price: 100,
                      quantity: 1,
                    },
                  ],
                },
              },
            });
          },
          { maxWait: 15000, timeout: 15000 }
        )
      )
    );

    const elapsed3 = Date.now() - startTime3;
    assert(orders3.length === 3, `3 Concurrent Users: All 3 orders processed atomically in ${elapsed3}ms`);

    const prodAfter3 = await db.product.findUnique({ where: { id: testProduct.id } });
    assert(
      prodAfter3?.stock === INITIAL_TEST_STOCK - 3,
      `3 Concurrent Users: Stock decremented correctly from ${INITIAL_TEST_STOCK} to ${prodAfter3?.stock}`
    );

    // ---------------------------------------------------------
    // TEST 2: 10 Concurrent Users Browsing & Checkout
    // ---------------------------------------------------------
    console.log('\n🧪 TEST 2: Simulating 10 Concurrent Users (Catalog Browsing & 10 Simultaneous Checkouts)...');
    const startTime10 = Date.now();

    // 10 concurrent writes at exact same millisecond
    const orders10 = await Promise.all(
      Array.from({ length: 10 }).map((_, idx) =>
        db.$transaction(
          async (tx) => {
            const updated = await tx.product.updateMany({
              where: { id: testProduct.id, stock: { gte: 1 } },
              data: { stock: { decrement: 1 } },
            });
            if (updated.count === 0) throw new Error('INSUFFICIENT_STOCK');

            return tx.order.create({
              data: {
                orderNumber: `ORD-10USER-${idx + 1}-${Date.now()}`,
                customerName: `زبون تزامن 10 - ${idx + 1}`,
                customerPhone: '0938229497',
                governorate: 'حلب',
                cityArea: 'الشهباء',
                address: 'شارع النصر',
                subtotal: 100,
                shippingFee: 15,
                total: 115,
                status: 'NEW',
                items: {
                  create: [
                    {
                      productId: testProduct.id,
                      productNameAr: testProduct.nameAr,
                      productNameEn: testProduct.nameEn,
                      price: 100,
                      quantity: 1,
                    },
                  ],
                },
              },
            });
          },
          { maxWait: 15000, timeout: 15000 }
        )
      )
    );

    const elapsed10 = Date.now() - startTime10;
    assert(orders10.length === 10, `10 Concurrent Users: All 10 orders completed successfully in ${elapsed10}ms`);

    const prodAfter10 = await db.product.findUnique({ where: { id: testProduct.id } });
    assert(
      prodAfter10?.stock === INITIAL_TEST_STOCK - 3 - 10,
      `10 Concurrent Users: Stock decremented accurately to ${prodAfter10?.stock}`
    );

    // ---------------------------------------------------------
    // TEST 3: 25 Concurrent Users & Over-subscription Protection
    // ---------------------------------------------------------
    console.log('\n🧪 TEST 3: Simulating 25 Concurrent Users & Over-subscription Protection...');

    // Set stock to exactly 10 units
    await db.product.update({
      where: { id: testProduct.id },
      data: { stock: 10 },
    });

    const startTime25 = Date.now();
    let successCount25 = 0;
    let rejectedCount25 = 0;

    // 25 users attempt to buy 1 unit each at the exact same millisecond
    const results25 = await Promise.allSettled(
      Array.from({ length: 25 }).map((_, idx) =>
        db.$transaction(
          async (tx) => {
            const updated = await tx.product.updateMany({
              where: { id: testProduct.id, stock: { gte: 1 } },
              data: { stock: { decrement: 1 } },
            });
            if (updated.count === 0) {
              throw new Error('INSUFFICIENT_STOCK');
            }

            return tx.order.create({
              data: {
                orderNumber: `ORD-25USER-${idx + 1}-${Date.now()}`,
                customerName: `زبون 25 - ${idx + 1}`,
                customerPhone: '0938229497',
                governorate: 'اللاذقية',
                cityArea: 'الكورنيش',
                address: 'شارع البحر',
                subtotal: 100,
                shippingFee: 20,
                total: 120,
                status: 'NEW',
                items: {
                  create: [
                    {
                      productId: testProduct.id,
                      productNameAr: testProduct.nameAr,
                      productNameEn: testProduct.nameEn,
                      price: 100,
                      quantity: 1,
                    },
                  ],
                },
              },
            });
          },
          { maxWait: 15000, timeout: 15000 }
        )
      )
    );

    results25.forEach((res) => {
      if (res.status === 'fulfilled') successCount25++;
      else rejectedCount25++;
    });

    const elapsed25 = Date.now() - startTime25;
    const finalProd25 = await db.product.findUnique({ where: { id: testProduct.id } });

    assert(
      successCount25 === 10 && rejectedCount25 === 15,
      `25 Concurrent Users: Exactly 10 orders succeeded and 15 safely rejected (${elapsed25}ms)`
    );
    assert(
      finalProd25?.stock === 0,
      `Race Condition & Stock Safety: Final stock is exactly 0 (ZERO negative stock!)`
    );

    // ---------------------------------------------------------
    // TEST 4: Simultaneous Admin & Customer Operations
    // ---------------------------------------------------------
    console.log('\n🧪 TEST 4: Simulating Simultaneous Admin & Customer Operations...');

    // Reset stock to 20
    await db.product.update({ where: { id: testProduct.id }, data: { stock: 20 } });

    const customerAction = db.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          orderNumber: `ORD-MIXED-${Date.now()}`,
          customerName: 'زبون تزامن مع أدمن',
          customerPhone: '0938229497',
          governorate: 'حمص',
          cityArea: 'الدبلان',
          address: 'الشارع الرئيسي',
          subtotal: 100,
          shippingFee: 15,
          total: 115,
          status: 'NEW',
        },
      });
    });

    const adminAction1 = db.product.update({
      where: { id: testProduct.id },
      data: { price: 105 },
    });

    const adminAction2 = db.category.update({
      where: { id: testCategory.id },
      data: { nameAr: 'قسم اختبار التزامن المحدث' },
    });

    const adminAction3 = db.order.findMany({ take: 5 });

    const mixedResults = await Promise.all([customerAction, adminAction1, adminAction2, adminAction3]);
    assert(mixedResults.length === 4, 'Simultaneous Admin & Customer operations completed without lock conflict');

    // Clean up test records
    await db.order.deleteMany({
      where: { customerPhone: '0938229497', customerName: { contains: 'زبون' } },
    });
    await db.product.delete({ where: { id: testProduct.id } });
    await db.category.delete({ where: { id: testCategory.id } });

    console.log('\n----------------------------------------');
    console.log(`📊 Concurrency Load Test Results: ${passed} Passed | ${failed} Failed`);
    console.log('----------------------------------------\n');

    if (failed === 0) {
      console.log('🎉 ALL CONCURRENCY & LOAD AUDIT TESTS PASSED SUCCESSFULLY!');
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Concurrency test failure:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

runConcurrencyTestSuite();
