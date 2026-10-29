'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice, formatShippingFee } from '@/lib/utils';
import { Eye, Phone, MapPin, CheckCircle, Clock, Truck, XCircle, X, Ticket } from 'lucide-react';

export default function OrderManagementClient({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [activeModalOrder, setActiveModalOrder] = useState<any | null>(null);

  const statusOptions = [
    { label: 'الكل', value: 'ALL' },
    { label: 'جديد (NEW)', value: 'NEW' },
    { label: 'مؤكد (CONFIRMED)', value: 'CONFIRMED' },
    { label: 'قيد التجهيز (PROCESSING)', value: 'PROCESSING' },
    { label: 'تم الشحن (SHIPPED)', value: 'SHIPPED' },
    { label: 'تم التسليم (DELIVERED)', value: 'DELIVERED' },
    { label: 'ملغي (CANCELLED)', value: 'CANCELLED' },
  ];

  const filteredOrders = orders.filter((o) =>
    selectedStatusFilter === 'ALL' ? true : o.status === selectedStatusFilter
  );

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('فشل التعديل');

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      if (activeModalOrder && activeModalOrder.id === orderId) {
        setActiveModalOrder({ ...activeModalOrder, status: newStatus });
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Status Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-dark-900 p-3 rounded-2xl border border-dark-800 text-xs">
        {statusOptions.map((st) => (
          <button
            key={st.value}
            onClick={() => setSelectedStatusFilter(st.value)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              selectedStatusFilter === st.value
                ? 'bg-neon text-dark-950 shadow-md'
                : 'bg-dark-950 text-zinc-300 hover:text-white border border-dark-700'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-dark-950 text-zinc-400 border-b border-dark-800">
              <tr>
                <th className="p-4">رقم الطلب</th>
                <th className="p-4">الزبون والهاتف</th>
                <th className="p-4">المحافظة والعنوان</th>
                <th className="p-4">المجموع</th>
                <th className="p-4">التاريخ</th>
                <th className="p-4">حالة الطلب</th>
                <th className="p-4 text-center">التفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800 text-zinc-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    لا توجد طلبات في الفئة المختارة
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-dark-950/50">
                    <td className="p-4 font-mono font-bold text-neon">
                      <div>{o.orderNumber}</div>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.paymentMethod === 'SHAM_CASH'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-dark-950 text-zinc-400 border border-dark-700'
                      }`}>
                        {o.paymentMethod === 'SHAM_CASH' ? '📱 شام كاش' : '💵 كاش'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{o.customerName}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{o.customerPhone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{o.governorate}</div>
                      <div className="text-[11px] text-zinc-400">{o.cityArea} - {o.address}</div>
                    </td>
                    <td className="p-4 font-black text-white">{formatPrice(o.total, 'ar')}</td>
                    <td className="p-4 text-zinc-400">
                      {new Date(o.createdAt).toLocaleDateString('ar-SY')}
                    </td>
                    <td className="p-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="bg-dark-950 border border-dark-700 rounded-lg py-1 px-2 text-xs font-bold text-white focus:border-neon"
                      >
                        <option value="NEW">جديد (NEW)</option>
                        <option value="CONFIRMED">مؤكد (CONFIRMED)</option>
                        <option value="PROCESSING">قيد التجهيز (PROCESSING)</option>
                        <option value="SHIPPED">تم الشحن (SHIPPED)</option>
                        <option value="DELIVERED">تم التسليم (DELIVERED)</option>
                        <option value="CANCELLED">ملغي (CANCELLED)</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setActiveModalOrder(o)}
                        className="p-1.5 rounded bg-dark-950 border border-dark-700 text-neon hover:border-neon"
                        title="معاينة التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-700 rounded-3xl p-6 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-dark-800 pb-3">
              <h3 className="font-black text-lg">تفاصيل الطلب: {activeModalOrder.orderNumber}</h3>
              <button onClick={() => setActiveModalOrder(null)} className="p-1 rounded bg-dark-950 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <p><strong className="text-white">الاسم:</strong> {activeModalOrder.customerName}</p>
              <p><strong className="text-white">الهاتف:</strong> {activeModalOrder.customerPhone}</p>
              <p><strong className="text-white">المحافظة والمنطقة:</strong> {activeModalOrder.governorate} - {activeModalOrder.cityArea}</p>
              <p><strong className="text-white">العنوان:</strong> {activeModalOrder.address}</p>
              <p>
                <strong className="text-white">طريقة الدفع:</strong>{' '}
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  activeModalOrder.paymentMethod === 'SHAM_CASH'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'bg-dark-950 text-zinc-300 border border-dark-700'
                }`}>
                  {activeModalOrder.paymentMethod === 'SHAM_CASH' ? '📱 تحويل شام كاش (Sham Cash)' : '💵 الدفع نقداً عند الاستلام'}
                </span>
              </p>
              <p>
                <strong className="text-white">أجور التوصيل / الشحن:</strong>{' '}
                <span className="text-neon font-bold">
                  {formatShippingFee(activeModalOrder.shippingFee, activeModalOrder.governorate, 'ar')}
                </span>
              </p>
              {activeModalOrder.couponCode && (
                <p className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>كوبون الخصم: {activeModalOrder.couponCode} (خصم: {activeModalOrder.discount} $)</span>
                </p>
              )}
              {activeModalOrder.notes && <p><strong className="text-white">ملاحظات:</strong> {activeModalOrder.notes}</p>}
            </div>

            <div className="border-t border-dark-800 pt-3 space-y-2">
              <h4 className="font-bold text-sm text-neon">المنتجات في الطلب:</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {activeModalOrder.items.map((item: any) => (
                  <div key={item.id} className="p-2 rounded bg-dark-950 border border-dark-800 flex justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{item.productNameAr}</span>
                      {item.variantInfo && <span className="text-[10px] text-zinc-400">{item.variantInfo}</span>}
                    </div>
                    <div className="text-left font-mono">
                      <span>{item.quantity} × {item.price} $</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-dark-800 pt-3 flex justify-between font-black text-base text-neon">
              <span>إجمالي المنتجات:</span>
              <span>{formatPrice(activeModalOrder.total, 'ar')}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
