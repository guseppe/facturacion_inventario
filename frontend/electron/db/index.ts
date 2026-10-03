const Database = eval('require')('better-sqlite3');
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

// Use app.getPath if inside Electron, otherwise use cwd (for migrations via drizzle-kit if needed)
const isElectron = process && process.versions && process.versions.electron;
const userDataPath = isElectron ? app.getPath('userData') : process.cwd();
const dbDir = path.join(userDataPath, 'db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'app.db');

import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Run migrations on startup
try {
  // In dev mode, APP_ROOT is frontend/. In prod, it's the resources/app folder
  const migrationsFolder = process.env.VITE_DEV_SERVER_URL 
    ? path.join(process.cwd(), 'electron/db/migrations') 
    : path.join(process.env.APP_ROOT || process.cwd(), 'dist-electron/db/migrations');
    
  migrate(db, { migrationsFolder });
  console.log('Database migrations applied successfully');
} catch (e) {
  console.error('Error applying migrations:', e);
}
