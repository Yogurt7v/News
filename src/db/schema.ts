import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  uuid,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations, InferSelectModel } from 'drizzle-orm';
import { AdapterAccount } from 'next-auth/adapters';

// Enum для роли пользователя (можно использовать pgEnum)
export const roleEnum = pgEnum('role', ['user', 'admin']);

// Таблица пользователей
export const users = pgTable('users', {
  id: text('id').primaryKey().notNull(),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  password: text('password'),
  name: text('name'),
  image: text('image'),
  role: roleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица аккаунтов (для OAuth)
export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

// Таблица сессий
export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// Таблица для верификационных токенов (например, для email)
export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

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

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  newsId: uuid('news_id')
    .notNull()
    .references(() => news.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'photo', 'video', 'document'
  url: text('url').notNull(),
  order: integer('order').notNull().default(0), // порядок в сообщении
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const subscriptions = pgTable(
  'subscriptions',
  {
    // Колонка: ID пользователя (ссылается на таблицу users)
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // onDelete: 'cascade' означает: если пользователь удалится, все его подписки тоже удалятся автоматически

    // Колонка: имя канала (просто текст)
    channelUsername: text('channel_username').notNull(),

    // Колонка: дата и время подписки (по умолчанию — текущее время)
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    // Составной первичный ключ: гарантирует, что один пользователь не может
    // подписаться на один и тот же канал дважды
    pk: primaryKey({ columns: [table.userId, table.channelUsername] }),
  })
);

export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const groupChannels = pgTable(
  'group_channels',
  {
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    channelUsername: text('channel_username').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    // Составной первичный ключ: один канал может быть добавлен в группу только один раз
    pk: primaryKey({ columns: [table.groupId, table.channelUsername] }),
  })
);

// Отношения
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  news: many(news),
}));

export const newsRelations = relations(news, ({ one, many }) => ({
  category: one(categories, {
    fields: [news.categoryId],
    references: [categories.id],
  }),
  media: many(media),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  news: one(news, {
    fields: [media.newsId],
    references: [news.id],
  }),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  channels: many(groupChannels),
}));

export const groupChannelsRelations = relations(
  groupChannels,
  ({ one }) => ({
    group: one(groups, {
      fields: [groupChannels.groupId],
      references: [groups.id],
    }),
  })
);

export type DbUser = InferSelectModel<typeof users>;
export type DbSession = InferSelectModel<typeof sessions>;
export type DbAccount = InferSelectModel<typeof accounts>;
export type DbVerificationToken = InferSelectModel<
  typeof verificationTokens
>;
