import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET() {
  try {
    const areas = await db.shippingArea.findMany({
      orderBy: { governorateEn: 'asc' },
    });
    return NextResponse.json(areas);
  } catch (error) {
    console.error('Fetch shipping areas error:', error);
    return NextResponse.json({ error: 'Failed to fetch shipping areas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { governorateAr, governorateEn, shippingFee } = await request.json();
    if (!governorateAr || !governorateEn || shippingFee === undefined) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const area = await db.shippingArea.create({
      data: {
        governorateAr,
        governorateEn,
        shippingFee: parseFloat(shippingFee),
      },
    });

    return NextResponse.json(area, { status: 201 });
  } catch (error) {
    console.error('Create shipping area error:', error);
    return NextResponse.json({ error: 'Failed to create shipping area' }, { status: 500 });
  }
}
