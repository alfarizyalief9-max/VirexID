import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

/**
 * Inisialisasi Prisma Client tunggal (Singleton)
 * Mendukung pembacaan & penulisan database SQLite di lingkungan Serverless Vercel (/tmp)
 */

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL || 'file:./dev.db';

  if (process.env.VERCEL && envUrl.startsWith('file:')) {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      const possibleSources = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
      ];
      for (const src of possibleSources) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDbPath);
            console.log(`Berhasil menyalin SQLite DB ke ${tmpDbPath}`);
            break;
          } catch (e: any) {
            console.error('Gagal menyalin sqlite db ke /tmp:', e.message);
          }
        }
      }
    }
    return `file:${tmpDbPath}`;
  }

  return envUrl;
}

const dbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
