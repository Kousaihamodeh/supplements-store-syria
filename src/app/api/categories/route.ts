import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { generateSlug } from '@/lib/utils';
import { autoBackupSafe } from '@/lib/backup-helper';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Fetch categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح - يرجى إعادة تسجيل الدخول كـ Admin' }, { status: 401 });
    }

    const { nameAr, nameEn, descriptionAr, descriptionEn, image, sortOrder } = await request.json();
    if (!nameAr || !nameEn) {
      return NextResponse.json({ error: 'يرجى إدخال اسم القسم باللغة العربية والإنجليزية' }, { status: 400 });
    }

    let baseSlug = generateSlug(nameEn) || 'category';
    let slug = baseSlug;
    let counter = 1;
    while (await db.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const category = await db.category.create({
      data: {
        nameAr,
        nameEn,
        slug,
        descriptionAr: descriptionAr || null,
        descriptionEn: descriptionEn || null,
        image: image || null,
        sortOrder: parseInt(sortOrder || 0),
      },
    });

    autoBackupSafe();
    revalidatePath('/', 'layout');

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: error.message || 'فشل إضافة القسم' }, { status: 500 });
  }
}
