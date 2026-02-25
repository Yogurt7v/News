import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path'; // Добавьте этот импорт

dotenv.config();

const runMigrations = async () => {
  // Проверка на наличие URL, чтобы не упасть с невнятной ошибкой
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in .env');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  console.log('Running migrations...');

  try {
    // Используем абсолютный путь для надежности
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'drizzle'),
    });
    console.log('✅ Migrations completed!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    throw err; // Пробросим выше для обработки в catch внизу
  } finally {
    await pool.end();
  }
};

runMigrations().catch((err) => {
  process.exit(1);
});
