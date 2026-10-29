import React from 'react';
import { db } from '@/lib/db';
import CouponManagementClient from './CouponManagementClient';
import { Ticket } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-dark-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-neon" />
            <span>إدارة كوبونات الخصم</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            أنشئ كوبونات خصم (نسبة مئوية % أو مبلغ ثابت $) لزبائن المتجر مع تحديد شروط الاستخدام والانتهاء.
          </p>
        </div>
      </div>

      <CouponManagementClient initialCoupons={coupons} />
    </div>
  );
}
