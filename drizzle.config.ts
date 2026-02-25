
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql', // Указываем базу здесь
  schema: './src/db/schema.ts', // Путь к вашим моделям
  out: './drizzle', // Папка для SQL миграций
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
