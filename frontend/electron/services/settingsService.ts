import { db } from '../db';
import { storeSettings } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function getStoreSettingsService() {
  const settings = await db.select().from(storeSettings).limit(1);
  return settings[0] || null;
}

export async function updateStoreSettingsService(settingsData: any) {
  let settings = await db.select().from(storeSettings).limit(1);
  if (settings.length > 0) {
    const updated = await db.update(storeSettings)
      .set(settingsData)
      .where(eq(storeSettings.id, settings[0].id))
      .returning();
    return updated[0];
  } else {
    const id = crypto.randomUUID();
    const newSettings = await db.insert(storeSettings).values({ id, ...settingsData }).returning();
    return newSettings[0];
  }
}
