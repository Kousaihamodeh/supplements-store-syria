import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function updateCurrency() {
  await db.storeSettings.upsert({
    where: { id: 'default' },
    update: { currencyAr: '$', currencyEn: '$' },
    create: { currencyAr: '$', currencyEn: '$' },
  });
  console.log('✅ Successfully updated store currency to $ in database.');
  await db.$disconnect();
}

updateCurrency();
