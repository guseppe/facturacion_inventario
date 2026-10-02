import Database from 'better-sqlite3';
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

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
