import { db } from '@/lib/db';
import ShippingManagementClient from './ShippingManagementClient';

export const revalidate = 0;

export default async function AdminShippingPage() {
  const shippingAreas = await db.shippingArea.findMany({
    orderBy: { governorateEn: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">أجور الشحن والمحافظات / Shipping Fees</h1>
        <p className="text-xs text-zinc-400 mt-1">تعديل وإدارة تكاليف التوصيل لكل محافظة سورية</p>
      </div>

      <ShippingManagementClient initialAreas={shippingAreas} />
    </div>
  );
}
