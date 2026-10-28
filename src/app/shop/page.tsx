import { db } from '@/lib/db';
import { ShopClientContent } from '@/components/store/ShopClientContent';

export const revalidate = 0;

interface ShopPageProps {
  searchParams: {
    search?: string;
    category?: string;
    brand?: string;
    onSale?: string;
    sort?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { search, category, brand, onSale, sort = 'newest' } = searchParams;

  const [categories, brands, products] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    db.brand.findMany({ where: { isActive: true }, orderBy: { nameEn: 'asc' } }),
    db.product.findMany({
      where: {
        isActive: true,
        ...(search
          ? {
              OR: [
                { nameAr: { contains: search } },
                { nameEn: { contains: search } },
                { descriptionAr: { contains: search } },
                { descriptionEn: { contains: search } },
              ],
            }
          : {}),
        ...(category ? { category: { slug: category } } : {}),
        ...(brand ? { brand: { slug: brand } } : {}),
        ...(onSale === 'true' ? { isOnSale: true } : {}),
      },
      orderBy:
        sort === 'price-low'
          ? { price: 'asc' }
          : sort === 'price-high'
          ? { price: 'desc' }
          : { createdAt: 'desc' },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    }),
  ]);

  return (
    <ShopClientContent
      categories={categories}
      brands={brands}
      products={products}
      search={search}
      category={category}
      brand={brand}
      sort={sort}
    />
  );
}
