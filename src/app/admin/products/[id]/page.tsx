import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';

export const revalidate = 0;

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories, brands] = await Promise.all([
    db.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
    }),
    db.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    db.brand.findMany({ orderBy: { nameEn: 'asc' } }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">تعديل المنتج / Edit Product</h1>
        <p className="text-xs text-zinc-400 mt-1">{product.nameAr} ({product.nameEn})</p>
      </div>

      <ProductForm initialData={product} categories={categories} brands={brands} />
    </div>
  );
}
