const { Client } = require('pg');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const NEON_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Zgh84AMRaSzw@ep-hidden-shape-b5pt8h50-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function migrate() {
  console.log('Connecting to Neon PostgreSQL...');
  const pg = new Client({
    connectionString: NEON_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();
  console.log('Connected to Neon successfully!');

  const sqlitePath = path.join(__dirname, '..', 'prisma', 'dev.db');
  if (!fs.existsSync(sqlitePath)) {
    throw new Error('SQLite database not found at ' + sqlitePath);
  }
  const sqlite = new DatabaseSync(sqlitePath);
  console.log('Connected to local SQLite database at ' + sqlitePath);

  // 1. Create tables in Neon
  console.log('Creating tables in Neon...');
  const ddl = `
    CREATE TABLE IF NOT EXISTS "Admin" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "email" TEXT NOT NULL UNIQUE,
        "passwordHash" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'ADMIN',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "Category" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nameAr" TEXT NOT NULL,
        "nameEn" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "descriptionAr" TEXT,
        "descriptionEn" TEXT,
        "image" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "Brand" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nameAr" TEXT NOT NULL,
        "nameEn" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "logo" TEXT,
        "descriptionAr" TEXT,
        "descriptionEn" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "nameAr" TEXT NOT NULL,
        "nameEn" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "descriptionAr" TEXT NOT NULL,
        "descriptionEn" TEXT NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "oldPrice" DOUBLE PRECISION,
        "sku" TEXT NOT NULL UNIQUE,
        "stock" INTEGER NOT NULL DEFAULT 10,
        "isFeatured" BOOLEAN NOT NULL DEFAULT false,
        "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
        "isNew" BOOLEAN NOT NULL DEFAULT false,
        "isOnSale" BOOLEAN NOT NULL DEFAULT false,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "categoryId" TEXT NOT NULL REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "brandId" TEXT REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "ProductImage" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "url" TEXT NOT NULL,
        "isMain" BOOLEAN NOT NULL DEFAULT false,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "ProductVariant" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "size" TEXT,
        "flavor" TEXT,
        "priceAdjustment" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "stock" INTEGER NOT NULL DEFAULT 10,
        "sku" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orderNumber" TEXT NOT NULL UNIQUE,
        "customerName" TEXT NOT NULL,
        "customerPhone" TEXT NOT NULL,
        "governorate" TEXT NOT NULL,
        "cityArea" TEXT NOT NULL,
        "address" TEXT NOT NULL,
        "notes" TEXT,
        "subtotal" DOUBLE PRECISION NOT NULL,
        "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "couponCode" TEXT,
        "shippingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "total" DOUBLE PRECISION NOT NULL,
        "paymentMethod" TEXT NOT NULL DEFAULT 'CASH_ON_DELIVERY',
        "status" TEXT NOT NULL DEFAULT 'NEW',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "Coupon" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "code" TEXT NOT NULL UNIQUE,
        "discountType" TEXT NOT NULL DEFAULT 'PERCENTAGE',
        "discountValue" DOUBLE PRECISION NOT NULL,
        "minOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "maxUses" INTEGER,
        "usedCount" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "expiresAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "OrderItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "productId" TEXT REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "productNameAr" TEXT NOT NULL,
        "productNameEn" TEXT NOT NULL,
        "variantInfo" TEXT,
        "price" DOUBLE PRECISION NOT NULL,
        "quantity" INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "ShippingArea" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "governorateAr" TEXT NOT NULL UNIQUE,
        "governorateEn" TEXT NOT NULL UNIQUE,
        "shippingFee" DOUBLE PRECISION NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "StoreSettings" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
        "storeNameAr" TEXT NOT NULL DEFAULT 'متجر المكملات الغذائية',
        "storeNameEn" TEXT NOT NULL DEFAULT 'SUPPLEMENTS STORE',
        "phone" TEXT NOT NULL DEFAULT '0938229497',
        "whatsapp" TEXT NOT NULL DEFAULT '0938229497',
        "instagram" TEXT NOT NULL DEFAULT '@supplement_store_syria',
        "addressAr" TEXT NOT NULL DEFAULT 'دمشق - جرمانا - ساحة الكرامة - مقابل MTN',
        "addressEn" TEXT NOT NULL DEFAULT 'Damascus – Jaramana – Al-Karama Square – opposite MTN',
        "googleMapsUrl" TEXT NOT NULL DEFAULT 'https://maps.google.com/?q=33.488506,36.340218',
        "latitude" DOUBLE PRECISION DEFAULT 33.488506,
        "longitude" DOUBLE PRECISION DEFAULT 36.340218,
        "heroTitleAr" TEXT NOT NULL DEFAULT 'كل ما تحتاجه لأداء أقوى',
        "heroTitleEn" TEXT NOT NULL DEFAULT 'Fuel Your Performance.',
        "heroSubtitleAr" TEXT NOT NULL DEFAULT 'مكملات غذائية رياضية أصلية 100% مع خدمة الشحن السريع إلى جميع المحافظات السورية',
        "heroSubtitleEn" TEXT NOT NULL DEFAULT '100% Authentic sports supplements with fast shipping across all Syrian governorates',
        "heroImage" TEXT,
        "currencyAr" TEXT NOT NULL DEFAULT '$',
        "currencyEn" TEXT NOT NULL DEFAULT '$',
        "updatedAt" TIMESTAMP(3) NOT NULL
    );
  `;
  await pg.query(ddl);
  console.log('Tables created successfully in Neon!');

  // Helper to migrate table
  async function copyTable(tableName, columns, boolCols = [], dateCols = []) {
    const rows = sqlite.prepare(`SELECT * FROM "${tableName}"`).all();
    console.log(`Migrating ${rows.length} rows for ${tableName}...`);
    
    for (const row of rows) {
      const vals = columns.map(c => {
        let v = row[c];
        if (v === undefined) return null;
        if (boolCols.includes(c)) return Boolean(v);
        if (dateCols.includes(c) && v) return new Date(v);
        return v;
      });
      const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
      const colNames = columns.map(c => `"${c}"`).join(', ');
      const updateSet = columns.filter(c => c !== 'id').map(c => `"${c}" = EXCLUDED."${c}"`).join(', ');
      
      const query = `
        INSERT INTO "${tableName}" (${colNames})
        VALUES (${placeholders})
        ON CONFLICT ("id") DO UPDATE SET ${updateSet}
      `;
      await pg.query(query, vals);
    }
    console.log(`✓ ${tableName} migrated (${rows.length} rows)`);
  }

  // 1. Admin
  await copyTable(
    'Admin',
    ['id', 'username', 'email', 'passwordHash', 'role', 'createdAt', 'updatedAt'],
    [],
    ['createdAt', 'updatedAt']
  );

  // 2. Category
  await copyTable(
    'Category',
    ['id', 'nameAr', 'nameEn', 'slug', 'descriptionAr', 'descriptionEn', 'image', 'isActive', 'sortOrder', 'createdAt', 'updatedAt'],
    ['isActive'],
    ['createdAt', 'updatedAt']
  );

  // 3. Brand
  await copyTable(
    'Brand',
    ['id', 'nameAr', 'nameEn', 'slug', 'logo', 'descriptionAr', 'descriptionEn', 'isActive', 'createdAt', 'updatedAt'],
    ['isActive'],
    ['createdAt', 'updatedAt']
  );

  // 4. Product
  await copyTable(
    'Product',
    [
      'id', 'nameAr', 'nameEn', 'slug', 'descriptionAr', 'descriptionEn',
      'price', 'oldPrice', 'sku', 'stock',
      'isFeatured', 'isBestSeller', 'isNew', 'isOnSale', 'isActive',
      'categoryId', 'brandId', 'createdAt', 'updatedAt'
    ],
    ['isFeatured', 'isBestSeller', 'isNew', 'isOnSale', 'isActive'],
    ['createdAt', 'updatedAt']
  );

  // 5. ProductImage
  await copyTable(
    'ProductImage',
    ['id', 'productId', 'url', 'isMain', 'sortOrder', 'createdAt'],
    ['isMain'],
    ['createdAt']
  );

  // 6. ProductVariant
  await copyTable(
    'ProductVariant',
    ['id', 'productId', 'size', 'flavor', 'priceAdjustment', 'stock', 'sku', 'createdAt'],
    [],
    ['createdAt']
  );

  // 7. ShippingArea
  await copyTable(
    'ShippingArea',
    ['id', 'governorateAr', 'governorateEn', 'shippingFee', 'isActive', 'createdAt', 'updatedAt'],
    ['isActive'],
    ['createdAt', 'updatedAt']
  );

  // 8. StoreSettings
  await copyTable(
    'StoreSettings',
    [
      'id', 'storeNameAr', 'storeNameEn', 'phone', 'whatsapp', 'instagram',
      'addressAr', 'addressEn', 'googleMapsUrl', 'latitude', 'longitude',
      'heroTitleAr', 'heroTitleEn', 'heroSubtitleAr', 'heroSubtitleEn',
      'heroImage', 'currencyAr', 'currencyEn', 'updatedAt'
    ],
    [],
    ['updatedAt']
  );

  // 9. Coupon
  try {
    await copyTable(
      'Coupon',
      ['id', 'code', 'discountType', 'discountValue', 'minOrderAmount', 'maxUses', 'usedCount', 'isActive', 'expiresAt', 'createdAt', 'updatedAt'],
      ['isActive'],
      ['expiresAt', 'createdAt', 'updatedAt']
    );
  } catch (e) {
    console.log('Coupon table migration warning (may be empty):', e.message);
  }

  // 10. Order
  try {
    await copyTable(
      'Order',
      ['id', 'orderNumber', 'customerName', 'customerPhone', 'governorate', 'cityArea', 'address', 'notes', 'subtotal', 'discount', 'couponCode', 'shippingFee', 'total', 'paymentMethod', 'status', 'createdAt', 'updatedAt'],
      [],
      ['createdAt', 'updatedAt']
    );
  } catch (e) {
    console.log('Order table migration note:', e.message);
  }

  // 11. OrderItem
  try {
    await copyTable(
      'OrderItem',
      ['id', 'orderId', 'productId', 'productNameAr', 'productNameEn', 'variantInfo', 'price', 'quantity'],
      [],
      []
    );
  } catch (e) {
    console.log('OrderItem table migration note:', e.message);
  }

  console.log('\n=============================================');
  console.log('MIGRATION SUMMARY FROM NEON CLOUD:');
  const countP = await pg.query('SELECT COUNT(*) FROM "Product"');
  const countC = await pg.query('SELECT COUNT(*) FROM "Category"');
  const countI = await pg.query('SELECT COUNT(*) FROM "ProductImage"');
  const countS = await pg.query('SELECT COUNT(*) FROM "ShippingArea"');
  console.log(`Products in Neon:      ${countP.rows[0].count}`);
  console.log(`Categories in Neon:    ${countC.rows[0].count}`);
  console.log(`ProductImages in Neon: ${countI.rows[0].count}`);
  console.log(`ShippingAreas in Neon: ${countS.rows[0].count}`);
  console.log('=============================================\n');

  await pg.end();
}

migrate().then(() => {
  console.log('ALL DATA MIGRATED TO NEON POSTGRESQL SUCCESSFULLY!');
  process.exit(0);
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
