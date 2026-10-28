import { db } from '@/lib/db';
import BrandManagementClient from './BrandManagementClient';

export const revalidate = 0;

export default async function AdminBrandsPage() {
  const brands = await db.brand.findMany({
    orderBy: { nameEn: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">إدارة الماركات العالمية / Brands</h1>
        <p className="text-xs text-zinc-400 mt-1">إضافة وتعديل العلامات التجارية للمكملات (Optimum Nutrition, MuscleTech, Dymatize...)</p>
      </div>

      <BrandManagementClient initialBrands={brands} />
    </div>
  );
}
