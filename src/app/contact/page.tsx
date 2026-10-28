import { db } from '@/lib/db';
import { StoreMapSection } from '@/components/store/StoreMapSection';
import { ContactClientHeader } from './ContactClientHeader';

export const revalidate = 0;

export default async function ContactPage() {
  const settings = await db.storeSettings.findUnique({ where: { id: 'default' } });

  return (
    <div className="space-y-12 py-10">
      <ContactClientHeader />
      <StoreMapSection settings={settings || undefined} />
    </div>
  );
}
