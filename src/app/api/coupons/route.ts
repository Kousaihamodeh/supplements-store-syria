import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(coupons);
  } catch (error: any) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'فشل جلب الكوبونات' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxUses,
      expiresAt,
      isActive,
    } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'رمز الكوبون مطلوب' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const val = parseFloat(discountValue);

    if (isNaN(val) || val <= 0) {
      return NextResponse.json({ error: 'قيمة الخصم غير صالحة' }, { status: 400 });
    }

    // Check duplicate
    const existing = await db.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json({ error: 'رمز الكوبون مستخدم مسبقاً' }, { status: 400 });
    }

    const coupon = await db.coupon.create({
      data: {
        code: cleanCode,
        discountType: discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
        discountValue: val,
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: error.message || 'فشل إنشاء الكوبون' }, { status: 500 });
  }
}
