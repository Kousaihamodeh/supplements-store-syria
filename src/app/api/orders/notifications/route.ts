import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const [newOrdersCount, latestOrders] = await Promise.all([
      db.order.count({
        where: { status: 'NEW' },
      }),
      db.order.findMany({
        where: { status: 'NEW' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          items: true,
        },
      }),
    ]);

    return NextResponse.json({
      newOrdersCount,
      latestOrders,
    });
  } catch (error: any) {
    console.error('Error checking order notifications:', error);
    return NextResponse.json({ error: 'فشل جلب الإشعارات' }, { status: 500 });
  }
}
