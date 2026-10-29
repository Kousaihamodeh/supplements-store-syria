import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const data: any = {};
    if (body.code !== undefined) data.code = body.code.trim().toUpperCase();
    if (body.discountType !== undefined) data.discountType = body.discountType;
    if (body.discountValue !== undefined) data.discountValue = parseFloat(body.discountValue);
    if (body.minOrderAmount !== undefined) data.minOrderAmount = parseFloat(body.minOrderAmount) || 0;
    if (body.maxUses !== undefined) data.maxUses = body.maxUses ? parseInt(body.maxUses) : null;
    if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const updated = await db.coupon.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ error: error.message || 'فشل تحديث الكوبون' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id } = params;
    await db.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: error.message || 'فشل حذف الكوبون' }, { status: 500 });
  }
}
