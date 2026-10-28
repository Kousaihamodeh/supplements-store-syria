import { db } from '@/lib/db';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, DollarSign, Package, AlertTriangle, ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [orders, productsCount, lowStockProducts] = await Promise.all([
    db.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { items: true },
    }),
    db.product.count({ where: { isActive: true } }),
    db.product.findMany({
      where: { stock: { lte: 5 } },
      take: 5,
    }),
  ]);

  const totalOrders = await db.order.count();
  const totalRevenue = (await db.order.aggregate({ _sum: { total: true } }))._sum.total || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">نظرة عامة / Dashboard Overview</h1>
        <p className="text-xs text-zinc-400 mt-1">ملخص المبيعات والطلبات والمخزون الحركي للمتجر</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-dark-900 rounded-2xl border border-dark-800 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase">إجمالي الطلبات</span>
            <ShoppingCart className="w-5 h-5 text-neon" />
          </div>
          <div className="text-3xl font-black text-white">{totalOrders}</div>
        </div>

        <div className="p-6 bg-dark-900 rounded-2xl border border-dark-800 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase">إجمالي المبيعات</span>
            <DollarSign className="w-5 h-5 text-neon" />
          </div>
          <div className="text-2xl font-black text-neon">{formatPrice(totalRevenue, 'ar')}</div>
        </div>

        <div className="p-6 bg-dark-900 rounded-2xl border border-dark-800 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase">المنتجات النشطة</span>
            <Package className="w-5 h-5 text-neon" />
          </div>
          <div className="text-3xl font-black text-white">{productsCount}</div>
        </div>

        <div className="p-6 bg-dark-900 rounded-2xl border border-dark-800 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-bold uppercase">منخفض المخزون</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-400">{lowStockProducts.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-dark-900 p-6 rounded-2xl border border-dark-800 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-800 pb-3">
            <h3 className="font-extrabold text-base text-white">آخر الطلبات</h3>
            <Link href="/admin/orders" className="text-xs text-neon font-bold hover:underline flex items-center gap-1">
              <span>عرض كافة الطلبات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-dark-950 text-zinc-400 border-b border-dark-800">
                <tr>
                  <th className="p-3">رقم الطلب</th>
                  <th className="p-3">الزبون</th>
                  <th className="p-3">المحافظة</th>
                  <th className="p-3">المجموع</th>
                  <th className="p-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800 text-zinc-200">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-dark-950/50">
                    <td className="p-3 font-mono font-bold text-neon">{o.orderNumber}</td>
                    <td className="p-3 font-bold">{o.customerName}</td>
                    <td className="p-3">{o.governorate}</td>
                    <td className="p-3 font-extrabold">{formatPrice(o.total, 'ar')}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-md bg-dark-950 border border-dark-700 text-zinc-300 font-bold text-[10px]">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning Box */}
        <div className="lg:col-span-4 bg-dark-900 p-6 rounded-2xl border border-dark-800 space-y-4">
          <h3 className="font-extrabold text-base text-white border-b border-dark-800 pb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>تنبيهات المخزون</span>
          </h3>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">جميع المنتجات متوفرة بكميات جيدة</p>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-dark-950 border border-dark-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-white line-clamp-1">{p.nameAr}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono font-bold">
                    باقي: {p.stock}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
