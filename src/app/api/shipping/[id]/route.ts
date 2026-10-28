import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { governorateAr, governorateEn, shippingFee, isActive } = await request.json();

    const area = await db.shippingArea.update({
      where: { id: params.id },
      data: {
        governorateAr,
        governorateEn,
        shippingFee: parseFloat(shippingFee),
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json(area);
  } catch (error) {
    console.error('Update shipping area error:', error);
    return NextResponse.json({ error: 'Failed to update shipping area' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.shippingArea.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete shipping area error:', error);
    return NextResponse.json({ error: 'Failed to delete shipping area' }, { status: 500 });
  }
}
