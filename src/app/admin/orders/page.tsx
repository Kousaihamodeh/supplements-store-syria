import { db } from '@/lib/db';
import OrderManagementClient from './OrderManagementClient';

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">إدارة الطلبات / Order Management</h1>
        <p className="text-xs text-zinc-400 mt-1">عرض طلبات الزبائن، تفاصيل الشحن، وتحديث حالة الطلب</p>
      </div>

      <OrderManagementClient initialOrders={orders} />
    </div>
  );
}
