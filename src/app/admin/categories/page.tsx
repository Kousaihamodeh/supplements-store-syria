import { db } from '@/lib/db';
import CategoryManagementClient from './CategoryManagementClient';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">إدارة الأقسام / Categories</h1>
        <p className="text-xs text-zinc-400 mt-1">إنشاء وتعديل تصنيفات المكملات الغذائية</p>
      </div>

      <CategoryManagementClient initialCategories={categories} />
    </div>
  );
}
