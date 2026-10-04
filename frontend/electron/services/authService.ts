import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// In a real app we'd use bcrypt or similar. Using basic hashing for desktop.
function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function loginService(credentials: any) {
  const { username, password } = credentials;
  
  if (!username || !password) {
    throw new Error('Usuario y contraseña requeridos');
  }

  const userArr = await db.select().from(users).where(eq(users.username, username));
  
  if (userArr.length === 0) {
    throw new Error('Credenciales inválidas');
  }

  const user = userArr[0];
  
  if (!user.isActive) {
    throw new Error('Usuario inactivo');
  }

  const inputHash = hashPassword(password);
  
  if (user.passwordHash !== inputHash) {
    // If the database has raw passwords for test users, let's also check that for convenience,
    // though in production it shouldn't happen.
    if (user.passwordHash !== password) {
      throw new Error('Credenciales inválidas');
    }
  }

  // Return user without password
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
