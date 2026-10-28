import { db } from '@/lib/db';
import { HomeClientContent } from '@/components/store/HomeClientContent';

export const revalidate = 0;

export default async function HomePage() {
  const [settings, categories, featuredProducts, bestSellers, totalProductsCount] = await Promise.all([
    db.storeSettings.findUnique({ where: { id: 'default' } }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
    db.product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
      take: 16,
    }),
    db.product.findMany({
      where: { isActive: true, isBestSeller: true },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
      take: 4,
    }),
    db.product.count({ where: { isActive: true } }),
  ]);

  return (
    <HomeClientContent
      settings={settings}
      categories={categories}
      featuredProducts={featuredProducts}
      bestSellers={bestSellers}
      totalProductsCount={totalProductsCount}
    />
  );
}
