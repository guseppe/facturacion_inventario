const Database = eval('require')('better-sqlite3');
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

const isPackaged = app.isPackaged;
const userDataPath = isPackaged ? app.getPath('userData') : process.cwd();
const dbDir = isPackaged ? path.join(userDataPath, 'db') : process.cwd();

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const dbPath = path.join(dbDir, 'app.db');

import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Run migrations on startup
try {
  const migrationsFolder = isPackaged
    ? path.join(process.resourcesPath, 'migrations')
    : path.join(process.cwd(), 'electron/db/migrations');
    
  migrate(db, { migrationsFolder });
  console.log('Database migrations applied successfully');

  // Seed default admin if no users exist
  const existingUsers = sqlite.prepare('SELECT id FROM users LIMIT 1').all();
  if (existingUsers.length === 0) {
    const crypto = require('crypto');
    const adminId = crypto.randomUUID();
    sqlite.prepare(
      "INSERT INTO users (id, username, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)"
    ).run(adminId, 'admin', '1995', 'ADMIN', 1);
    console.log('Default admin user created');
  }
} catch (e) {
  console.error('Error applying migrations or seeding:', e);
}
