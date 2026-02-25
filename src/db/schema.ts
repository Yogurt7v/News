import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  pgEnum,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum для роли пользователя (можно использовать pgEnum)
export const roleEnum = pgEnum('role', ['user', 'admin']);

// Таблица пользователей
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(), // или использовать cuid генератор
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  role: roleEnum('role').default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица категорий
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица новостей
export const news = pgTable('news', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  summary: text('summary'),
  source: text('source').notNull(),
  url: text('url').notNull().unique(),
  imageUrl: text('image_url'),
  categoryId: uuid('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  publishedAt: timestamp('published_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // AI-поля
  aiSummary: text('ai_summary'),
  sentiment: text('sentiment'),
  keywords: text('keywords').array(),
  analyzedAt: timestamp('analyzed_at'),
});

// Отношения (relations) – опционально, но удобно для запросов
export const categoriesRelations = relations(categories, ({ many }) => ({
  news: many(news),
}));

export const newsRelations = relations(news, ({ one }) => ({
  category: one(categories, {
    fields: [news.categoryId],
    references: [categories.id],
  }),
}));
