import { db } from '@/lib/db';
import StoreSettingsClient from './StoreSettingsClient';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  let settings = await db.storeSettings.findUnique({
    where: { id: 'default' },
  });

  if (!settings) {
    settings = await db.storeSettings.create({
      data: { id: 'default' },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">إعدادات المتجر & خرائط جوجل / Store Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">تعديل رابط خريطة جوجل، عنوان المتجر، أرقام التواصل، وعناوين الواجهة</p>
      </div>

      <StoreSettingsClient initialSettings={settings} />
    </div>
  );
}
