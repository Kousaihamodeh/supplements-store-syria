import { db } from '@/lib/db';
import { ProductForm } from '@/components/admin/ProductForm';

export const revalidate = 0;

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    db.brand.findMany({ orderBy: { nameEn: 'asc' } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">إضافة منتج جديد / Add Product</h1>
        <p className="text-xs text-zinc-400 mt-1">أدخل البيانات باللغتين العربية والإنجليزية مع رفع الصور وإضافة الخيارات</p>
      </div>

      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
