# AGENTS.md

Документ для агентных AI-ассистентов, работающих с этим репозиторием.

## Стек технологий

- **Framework**: Next.js 16 (App Router)
- **Язык**: TypeScript 5
- **Стилизация**: Tailwind CSS 4
- **База данных**: PostgreSQL + Drizzle ORM + PocketBase
- **ORM**: Drizzle ORM
- **Аутентификация**: PocketBase
- **Телеграм API**: @mtcute/node
- **Тестирование**: Jest + Playwright
- **Линтинг**: ESLint 9 + Prettier

## Команды

### Разработка

```bash
npm run dev          # Запуск dev-сервера
npm run build        # Production build
npm run start         # Запуск production-сервера
```

### Тестирование

```bash
npm test                         # Все unit-тесты (Jest)
npm test -- --testPathPattern="auth.service"  # Конкретный тест
npm test -- --watch             # Watch-режим
npm test -- --coverage          # С покрытием
npm run test:e2e                # E2E тесты (Playwright)
npm run test:e2e:ui            # E2E с UI
```

### Линтинг и форматирование

```bash
npm run lint        # ESLint
npx prettier --write src/**/*.ts src/**/*.tsx   # Форматирование
```

### База данных (Drizzle)

```bash
npm run db:generate   # Генерация миграций
npm run db:migrate    # Применение миграций
npm run db:test       # Тест подключения к БД
```

### Прочее

```bash
npm run telegram:test   # Тест Telegram API
npm run test:pb        # Тест PocketBase
npm run parse:run       # Запуск парсера
```

## Структура проекта

```
src/
├── app/                 # Next.js App Router (страницы, layouts, API routes)
├── db/                  # Схема БД (Drizzle), миграции
├── entities/            # Бизнес-сущности
├── features/            # Фичи по доменам (auth, subscriptions, groups)
│   └── {feature}/
│       ├── actions*.ts     # Server Actions
│       ├── services/       # Бизнес-логика
│       └── ui/            # UI компоненты фичи
├── lib/                 # Конфигурация (pocketbase.ts, auth)
├── shared/              # Общие утилиты
│   ├── api/             # Внешние API клиенты
│   ├── lib/             # Хуки и утилиты
│   ├── types/           # Общие типы
│   └── ui/             # Общие UI компоненты
├── types/              # Глобальные типы
└── widgets/            # Компоненты-виджеты (sidebar, news-card)
```

## Соглашения по коду

### Именование

- **Файлы**: kebab-case (`auth.service.ts`, `user-profile.tsx`)
- **Компоненты React**: PascalCase (`Sidebar.tsx`, `NewsCard.tsx`)
- **Функции/переменные**: camelCase
- **Типы/Интерфейсы**: PascalCase с суффиксом `Props`, `State` где уместно
- **Константы**: UPPER_SNAKE_CASE
- **База данных**: snake_case для колонок, camelCase для TypeScript

### Импорты

- Использовать псевдоним `@/` для абсолютных импортов (`@/features/auth`)
- Группировка: внешние пакеты → внутренние модули → относительные импорты
- Пустые строки между группами

```typescript
// 1. React
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Внешние пакеты
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

// 3. Внутренние модули (@/)
import { AuthService } from '@/features/auth/services/auth.service';
import { users } from '@/db/schema';

// 4. Относительные импорты
import { ConfirmModal } from './ConfirmModal';
```

### Типизация

- **Строгий режим TypeScript** включён (`strict: true`)
- Все функции должны иметь типизированные параметры и возвращаемые значения
- Использовать `interface` для объектов, `type` для объединений/примитивов
- Не использовать `any` без крайней необходимости
- Экспортировать типы из `src/types/` или рядом с кодом

```typescript
// Хорошо
interface UserProfile {
  id: string;
  email: string;
  name?: string;
}

// Хорошо
type ApiResponse<T> = { data: T; error?: string };

// Плохо
function handler(data: any) { ... }
```

### Server Actions

- Помечать файлы с Server Actions директивой `'use server'`
- Имя файла с суффиксом `.server.ts` или `.pb.ts`
- Все действия асинхронные
- Возвращать осмысленные ошибки

```typescript
'use server';

export async function subscribeToChannel(channelUsername: string) {
  // ...
}
```

### Обработка ошибок

- Использовать `try/catch` с конкретными типами ошибок
- Выбрасывать `Error` с понятным сообщением
- Не игнорировать ошибки без обработки

```typescript
// Хорошо
try {
  await pb.collection('subscriptions').create(data);
} catch (error: any) {
  if (error.status === 400 && error.data?.data?.channelUsername?.code === 'unique') {
    throw new Error('Вы уже подписаны на этот канал');
  }
  throw new Error('Ошибка при подписке');
}

// Плохо
try { ... } catch (e) { /* пусто */ }
```

### Компоненты React

- Все интерактивные компоненты с `'use client'`
- Использовать функциональный стиль с хуками
- Типизировать пропсы через интерфейс

```typescript
'use client';

interface NewsCardProps {
  title: string;
  url: string;
  imageUrl?: string;
}

export function NewsCard({ title, url, imageUrl }: NewsCardProps) {
  // ...
}
```

### Тестирование

- Файлы тестов рядом с исходным кодом, суффикс `.test.ts`
- Мокать зависимости через `jest.mock()`
- Очищать моки в `beforeEach`

```typescript
jest.mock('@/db', () => ({
  db: {
    insert: jest.fn(),
    query: { users: { findFirst: jest.fn() } },
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});
```

### Drizzle ORM

- Все таблицы в `src/db/schema.ts`
- Имя колонки через `text('snake_case')`
- Отношения через `relations()`
- Экспортировать типы `InferSelectModel`

```typescript
export const users = pgTable('users', {
  id: text('id').primaryKey().notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type DbUser = InferSelectModel<typeof users>;
```

## Prettier конфигурация

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 75
}
```

## Важные замечания

1. **Путь к базе данных**: `.env` содержит `DATABASE_URL` и `POCKETBASE_URL`
2. **PocketBase**: Используется для аутентификации, запускается отдельно (`pocketbase serve`)
3. **PocketBase URL по умолчанию**: `http://127.0.0.1:8090`
4. **Next.js path alias**: `@/` указывает на `src/`
