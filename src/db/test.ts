import 'dotenv/config';
import { db } from './index';
import { categories } from './schema';
import { eq } from 'drizzle-orm';

async function test() {
  try {
    // Создаём категорию
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: 'Технологии',
        slug: 'tech',
      })
      .returning();
    console.log('✅ Категория создана:', newCategory);

    // Читаем категорию
    const found = await db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.slug, 'tech'),
    });
    console.log('✅ Категория найдена:', found);

    // Удаляем категорию
    if (found) {
      await db.delete(categories).where(eq(categories.id, found.id));
      console.log('✅ Категория удалена');
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    process.exit(0);
  }
}

test();
