# Будь в курсе

Новостной агрегатор с автоматическим парсером Telegram-каналов.

## Описание

Веб-приложение для агрегации новостей из Telegram-каналов. Пользователи могут подписываться на каналы, группировать их в папки и читать новости в единой ленте с realtime обновлениями.

## Технологический стек

| Уровень      | Технология                                      |
| ------------ | ----------------------------------------------- |
| Frontend     | Next.js 16 (App Router), React 19, TypeScript 5 |
| Стилизация   | Tailwind CSS 4                                  |
| Backend      | PocketBase (аутентификация + API)               |
| Telegram API | @mtcute/node                                    |
| Тестирование | Jest, Playwright                                |
| Node.js      | 20.x LTS                                        |

---

## Архитектура системы

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              КЛИЕНТ (Браузер)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │  Sidebar    │  │  NewsList   │  │  MediaModal │                     │
│  └─────┬─────  ┘  └─────┬─────  ┘  └─────┬─────  ┘                      │
│        └──────────────  ┼───────────  ───┘                           │
│                      ▼                                              │
│              PocketBase SDK (Client)                                    │
│         ┌──────────────────────────┐                            │
│         │  pb.authStore (Cookie)   │                            │
│         └──────────────────────────┘                            │
└────────────────────────────┬──────────────────────────────────┘
                             │ HTTP + Cookie (pb_auth)
                             ▼
┌───────────────────────────────────────────────────────────────────┐
│                        NGINX / Прокси                              │
│              (Терминация HTTPS, статика)                           │
└────────────────────────────┬──────────────────────────────────────┘
                             │
    ┌────────────────────────┼────────────────────────────────────┐
    │                        ▼                                     │
    │  ┌──────────────────────────────────────────────────────────┐  │
    │  │                   NEXT.JS SERVER                         │  │
    │  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐   │  │
    │  │  │ Middleware  │  │  API Routes  │  │  Server       │   │  │
    │  │  │  (proxy.ts) │  │  (Auth/News) │  │  Components  │   │  │
    │  │  └─────┬─────┘  └──────┬─────┘  └─────────────┘   │  │
    │  │        │               │                            │  │
    │  │        │               ▼                            │  │
    │  │        │        Telegram Parser                    │  │
    │  │        │        (@mtcute/node)                 │  │
    │  │        │               │                            │  │
    │  │        │               ▼                            │  │
    │  │        │        PocketBase Admin SDK              │  │
    │  │        └───────────────┬──────────────────────────┘  │
    │  │                        │                           │
    │  └───────────────────────┼───────────────────────────┘  │
    │                          │                              │
    ▼                          ▼                              │
┌──────────────────────┐  ┌──────────────────────────────────┐
│   POCKETBASE         │  │  Telegram API (MTProto)          │
│   ┌────────────┐     │  │  ┌─────────────────────────────┐   │
│   │ Auth      │     │  │  │  Telegram Servers          │   │
│   │ Database │     │  │  │  (Telegram.org)           │   │
│   │ File API  │     │  │  └─────────────────────────────┘   │
│   └───────────┴─────┘  └──────────────────────────────────┘
└───────────────────────────────────────────────────────────────┘
```

### Поток данных

#### 1. Аутентификация

```
1. Пользователь входит через форму
2. POST /api/auth/login → PocketBase
3. PocketBase возвращает auth token
4. Frontend сохраняет в cookie (pb_auth)
5. При каждом запросе middleware валидирует cookie
```

#### 2. Загрузка новостей

```
1. Клиент запрашивает /api/news
2. Next.js Server Component получает подписки пользователя
3. Загружает новости из PocketBase (коллекция news)
4. Возвращает HTML + данных клиенту
```

#### 3. Парсинг (Cron/Manual)

```
1. Cron вызывает /api/cron/fetch-news
2. Сервер получает список каналов из БД
3. Подключается к Telegram через mtcute
4. Скачивает посты, медиафайлы
5. Сохраняет в PocketBase (news + media)
6. SSE отправляет логи клиенту
```

---

## Структура проекта

```
news/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                 # API endpoints
│   │   │   ├── auth/            # Аутентификация
│   │   │   │   ├── login/       # Вход
│   │   │   │   ├── register/    # Регистрация
│   │   │   │   ├── logout/      # Выход
│   │   │   │   ├── me/          # Текущий пользователь
│   │   │   │   ├── oauth/      # OAuth (Google, GitHub, Yandex)
│   │   │   │   └── oauth/      # OAuth callback
│   │   │   │   └── reset-password/
│   │   │   ├── news/           # Новости
│   │   │   ├── cron/           # Парсинг (SSE)
│   │   │   ├── subscriptions/ # Подписки
│   │   │   ├── groups/        # Группы
│   │   │   ├── files/         # Прокси файлов
│   │   │   └── telegram/      # Telegram API
│   │   ├── auth/              # Страницы авторизации
│   │   └── page/              # Главная страница
│   │
│   ├── features/                # Бизнес-фичи
│   │   ├── subscriptions/       # Подписки на каналы
│   │   │   ├── ui/           # UI компоненты
│   │   │   └── actions.server.ts
│   │   ├── groups/           # Группы каналов
│   │   │   ├── ui/
│   │   │   └── actions.server.ts
│   │   └── telegram-parser/  # Парсер Telegram
│   │       ├── parser.service.ts
│   │       └── types.ts
│   │
│   ├── widgets/                # UI компоненты
│   │   ├── sidebar/          # Боковая панель
│   │   ├── news-card/        # Карточки новостей
│   │   └── wallpaper/       # Фон приложения
│   │
│   ├── shared/                 # Общие утилиты
│   │   ├── api/             # API клиенты
│   │   │   └── telegram-mtcute/
│   │   ├── lib/             # Утилиты
│   │   │   ├── pocketbase.ts      # Client SDK
│   │   │   ├── pocketbase.server.ts  # Server SDK
│   │   │   ├── pocketbase-admin.ts # Admin SDK
│   │   │   ├── files.ts
│   │   │   ├── date.ts
│   │   │   └── useDebounce.ts
│   │   ├── config/           # Конфигурация
│   │   ├── types/           # Типы
│   │   └── ui/             # Переиспользуемые UI
│   │
│   ├── entities/              # Бизнес-сущности
│   ├── scripts/             # Скрипты запуска
│   │   ├── run-parser.ts
│   │   ├── export-session.ts
│   │   └── test-pocketbase.ts
│   │
│   ├── proxy.ts             # Middleware для авторизации
│
│
├── docker-compose.yml       # PostgreSQL (не используется)
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── jest.config.ts
└── playwright.config.ts
```

---

## Схема работы компонентов

### Frontend (Next.js)

- **Server Components**: `src/app/page/page.tsx`, `src/app/api/*/route.ts`
- **Client Components**: Интерактивные элементы (`'use client'`)
- **Rendering**: React Server Components (RSC) + Client hydration

### Middleware (proxy.ts)

```typescript
// src/proxy.ts
export async function proxy(request: NextRequest) {
  // 1. Проверяем исключения (статика, API)
  if (excluded) return NextResponse.next();

  // 2. Валидируем куку pb_auth
  const authCookie = request.cookies.get('pb_auth');
  if (!authCookie) return redirect('/auth/signin');

  // 3. Проверяем токен через PocketBase SDK
  pb.authStore.loadFromCookie(authCookie);
  if (!pb.authStore.isValid) return redirect('/auth/signin');

  // 4. Пропускаем запрос дальше
  return NextResponse.next();
}
```

### Telegram Parser (Парсер)

```typescript
// src/features/telegram-parser/parser.service.ts
class TelegramParserService {
  async getChannelPosts(client, channelUsername, limit) {
    // 1. Подключаемся к Telegram
    const messages = await client.getHistory(channelUsername, { limit });

    // 2. Группируем медиа (альбомы)
    const grouped = groupMediaById(messages);

    // 3. Скачиваем медиафайлы
    for (const group of grouped) {
      await this.downloadMedia(group);
    }

    // 4. Сохраняем в БД
    await pb.collection('news').create(post);
    await pb.collection('media').create(media);
  }
}
```

## База данных (PocketBase)

### Коллекции

| Коллекция       | Описание                             |
| --------------- | ------------------------------------ |
| `users`         | Пользователи (PocketBase встроенная) |
| `news`          | Новости из Telegram                  |
| `subscriptions` | Подписки пользователей               |
| `groups`        | Группы каналов                       |
| `media`         | Медиафайлы (фото, видео, документы)  |

### Схема news

| Поле        | Тип      | Описание                   |
| ----------- | -------- | -------------------------- |
| id          | auto     | Уникальный ID              |
| title       | text     | Заголовок поста            |
| content     | text     | Текст поста                |
| source      | text     | Username канала (@channel) |
| url         | text     | Ссылка на оригинал         |
| publishedAt | date     | Дата публикации            |
| viewCount   | number   | Количество просмотров      |
| media       | relation | Связь с медиа              |
| user        | relation | Пользователь (creator)     |

### Схема subscriptions

| Поле            | Тип      | Описание          |
| --------------- | -------- | ----------------- |
| id              | auto     | Уникальный ID     |
| user            | relation | Пользователь      |
| channelUsername | text     | Username канала   |
| channelTitle    | text     | Название канала   |
| group           | relation | Группа (nullable) |
| createdAt       | date     | Дата подписки     |

### Схема media

| Поле   | Тип      | Описание                   |
| ------ | -------- | -------------------------- |
| id     | auto     | Уникальный ID              |
| newsId | relation | Связь с новостью           |
| file   | file     | Медиафайл                  |
| type   | text     | Тип (photo/video/document) |
| order  | number   | Порядок в альбоме          |
| width  | number   | Ширина изображения         |
| height | number   | Высота изображения         |

---

## API Endpoints

### Аутентификация

| Метод | Путь                         | Описание             |
| ----- | ---------------------------- | -------------------- |
| POST  | `/api/auth/register`         | Регистрация          |
| POST  | `/api/auth/login`            | Вход                 |
| POST  | `/api/auth/logout`           | Выход                |
| GET   | `/api/auth/me`               | Текущий пользователь |
| GET   | `/api/auth/oauth/[provider]` | OAuth редирект       |
| GET   | `/api/auth/oauth/callback`   | OAuth callback       |
| POST  | `/api/auth/reset-password`   | Сброс пароля         |

### Новости

| Метод | Путь                   | Описание             |
| ----- | ---------------------- | -------------------- |
| GET   | `/api/news`            | Получение новостей   |
| GET   | `/api/cron/fetch-news` | Запуск парсера (SSE) |

### Подписки

| Метод | Путь                             | Описание     |
| ----- | -------------------------------- | ------------ |
| GET   | `/api/subscriptions/my`          | Мои подписки |
| POST  | `/api/subscriptions/subscribe`   | Подписаться  |
| POST  | `/api/subscriptions/unsubscribe` | Отписаться   |

### Группы

| Метод  | Путь                        | Описание        |
| ------ | --------------------------- | --------------- |
| GET    | `/api/groups`               | Список групп    |
| POST   | `/api/groups`               | Создать группу  |
| DELETE | `/api/groups/[id]`          | Удалить группу  |
| PUT    | `/api/groups/[id]`          | Обновить группу |
| GET    | `/api/groups/[id]/channels` | Каналы в группе |

### Файлы

| Метод | Путь                   | Описание           |
| ----- | ---------------------- | ------------------ |
| GET   | `/api/files/[...path]` | Прокси медиафайлов |

### Telegram

| Метод | Путь                   | Описание       |
| ----- | ---------------------- | -------------- |
| GET   | `/api/telegram/search` | Поиск каналов  |
| GET   | `/api/telegram/client` | Статус клиента |

---

## Установка и запуск

### Требования

- Node.js 20.x LTS
- PocketBase (локально или удалённо)

### Установка

```bash
# Клонирование
git clone <repo-url>
cd news

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env файл
```

### Запуск

```bash
# Dev сервер (frontend + API)
npm run dev

# Production сборка
npm run build
npm start

# Запуск парсера вручную
npm run parse:run
```

---

## Переменные окружения

| Переменная                   | Описание          | Пример                  |
| ---------------------------- | ----------------- | ----------------------- |
| `POCKETBASE_URL`             | URL PocketBase    | `http://127.0.0.1:8090` |
| `NEXT_PUBLIC_POCKETBASE_URL` | URL для клиента   | `http://127.0.0.1:8090` |
| `PB_ADMIN_EMAIL`             | Email админа PB   | `admin@example.com`     |
| `PB_ADMIN_PASSWORD`          | Пароль админа     | `password`              |
| `TELEGRAM_API_ID`            | Telegram API ID   | `123456`                |
| `TELEGRAM_API_HASH`          | Telegram API Hash | `abc123...`             |
| `TELEGRAM_SESSION_STRING`    | Сессия Telegram   | `AwAA...`               |
| `MT_CUTE_SESSION_STRING`     | Сессия mtcute     | `AwAA...`               |
| `CRON_SECRET`                | Секрет для cron   | `secret123`             |
| `POST_LIMIT`                 | Лимит постов      | `3`                     |

### OAuth (опционально)

| Переменная             | Описание     |
| ---------------------- | ------------ |
| `GOOGLE_CLIENT_ID`     | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GITHUB_CLIENT_ID`     | GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth |
| `YANDEX_CLIENT_ID`     | Yandex OAuth |
| `YANDEX_CLIENT_SECRET` | Yandex OAuth |

---

## Команды

```bash
npm run dev              # Dev сервер
npm run build           # Production сборка
npm run start           # Production сервер
npm run lint            # ESLint
npm run parse:run       # Запуск парсера
npm run session:export  # Экспорт сессии Telegram
npm run test:pb        # Тест подключения к PB

npm test               # Unit тесты (Jest)
npm test -- --watch    # Watch режим
npm test -- --coverage # С покрытием
npm run test:e2e       # E2E тесты (Playwright)
npm run test:e2e:ui    # E2E с UI
```

---

## Деплой

### Vercel (Frontend + API)

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Деплой произойдёт автоматически

### PocketBase (Backend)

**Вариант 1: Отдельный сервер**

```bash
# Скачайте PocketBase
wget https://github.com/pocketbase/pocketbase/releases/latest/pocketbase_*.zip
unzip pocketbase_*.zip

# Запуск
./pocketbase serve --http=0.0.0.0:8090
```

**Вариант 2: Vercel + PocketBase Cloud**

Используйте облачный PocketBase (pocketbase.com).

### Nginx (Production)

```bash
# Установка nginx
sudo apt install nginx

# Копирование конфига
sudo cp nginx.conf /etc/nginx/sites-available/be-informed
sudo ln -s /etc/nginx/sites-available/be-informed /etc/nginx/sites-enabled/

# Проверка и перезапуск
sudo nginx -t
sudo systemctl reload nginx
```

---

## TODO

- [ ] Тёмная тема
- [ ] PWA поддержка
- [ ] Тесты до 80%

---

## Лицензия

MIT
