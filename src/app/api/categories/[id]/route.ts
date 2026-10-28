import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { autoBackupSafe } from '@/lib/backup-helper';
import { revalidatePath } from 'next/cache';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح - يرجى إعادة تسجيل الدخول كـ Admin' }, { status: 401 });
    }

    const { nameAr, nameEn, descriptionAr, descriptionEn, image, sortOrder, isActive } = await request.json();

    const category = await db.category.update({
      where: { id: params.id },
      data: {
        nameAr,
        nameEn,
        descriptionAr: descriptionAr || null,
        descriptionEn: descriptionEn || null,
        image: image || null,
        sortOrder: parseInt(sortOrder || 0),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    autoBackupSafe();
    revalidatePath('/', 'layout');

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: error.message || 'فشل تعديل القسم' }, { status: 500 });
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

    await db.category.delete({
      where: { id: params.id },
    });

    autoBackupSafe();
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
