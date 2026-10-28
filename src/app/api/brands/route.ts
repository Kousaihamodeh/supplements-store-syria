import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';

export async function GET() {
  try {
    const brands = await db.brand.findMany({
      orderBy: { nameEn: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Fetch brands error:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nameAr, nameEn, logo, descriptionAr, descriptionEn } = await request.json();
    if (!nameAr || !nameEn) {
      return NextResponse.json({ error: 'Arabic and English names are required' }, { status: 400 });
    }

    const slug = generateSlug(nameEn);

    const brand = await db.brand.create({
      data: {
        nameAr,
        nameEn,
        slug,
        logo,
        descriptionAr,
        descriptionEn,
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error('Create brand error:', error);
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}
