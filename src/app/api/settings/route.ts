import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { autoBackupSafe } from '@/lib/backup-helper';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    let settings = await db.storeSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await db.storeSettings.create({
        data: {
          id: 'default',
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Fetch store settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch store settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getAdminFromCookies();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const updated = await db.storeSettings.upsert({
      where: { id: 'default' },
      update: {
        storeNameAr: body.storeNameAr,
        storeNameEn: body.storeNameEn,
        phone: body.phone,
        whatsapp: body.whatsapp,
        instagram: body.instagram,
        addressAr: body.addressAr,
        addressEn: body.addressEn,
        googleMapsUrl: body.googleMapsUrl,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        heroTitleAr: body.heroTitleAr,
        heroTitleEn: body.heroTitleEn,
        heroSubtitleAr: body.heroSubtitleAr,
        heroSubtitleEn: body.heroSubtitleEn,
        currencyAr: body.currencyAr || 'ل.س',
        currencyEn: body.currencyEn || 'SYP',
      },
      create: {
        id: 'default',
        ...body,
      },
    });

    autoBackupSafe();
    revalidatePath('/', 'layout');

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update store settings error:', error);
    return NextResponse.json({ error: 'Failed to update store settings' }, { status: 500 });
  }
}
