import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'رمز الكوبون مطلوب' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const currentSubtotal = Math.max(0, parseFloat(subtotal) || 0);

    const coupon = await db.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'كوبون الخصم غير صالح أو غير موجود' }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'لقد انتهت صلاحية هذا الكوبون' }, { status: 400 });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'تم استهلاك الحد الأقصى لاستخدام هذا الكوبون' }, { status: 400 });
    }

    if (coupon.minOrderAmount && currentSubtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        { error: `الحد الأدنى لقيمة الطلب لتطبيق هذا الكوبون هو ${coupon.minOrderAmount} $` },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round(((currentSubtotal * coupon.discountValue) / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(coupon.discountValue, currentSubtotal);
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      minOrderAmount: coupon.minOrderAmount,
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء فحص الكوبون' }, { status: 500 });
  }
}
