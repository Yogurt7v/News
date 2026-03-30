# Будь в курсе

Новостной агрегатор с автоматическим парсером Telegram каналов.

## Описание

Веб-приложение для агрегации новостей из Telegram-каналов. Пользователи могут подписываться на каналы, группировать их и читать новости в единой ленте.

## Технологический стек

| Уровень      | Технология                                      |
| ------------ | ----------------------------------------------- |
| Frontend     | Next.js 16 (App Router), React 19, TypeScript 5 |
| Стилизация   | Tailwind CSS 4                                  |
| Backend      | PocketBase                                      |
| Telegram API | @mtcute/node                                    |
| Тестирование | Jest, Playwright                                |
| Node.js      | 20.x LTS                                        |

## Функциональность

- **Парсинг новостей** — автоматический сбор постов из Telegram каналов
- **Realtime обновления** — автоматическое появление новостей без перезагрузки
- **Аутентификация** — регистрация, вход, OAuth (Google, GitHub, Yandex)
- **Подписки** — добавление/удаление Telegram каналов
- **Группировка** — создание папок для каналов
- **Лента новостей** — отображение с пагинацией и фильтрацией
- **Медиафайлы** — автоматическое скачивание фото и видео

## Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── auth/         # Аутентификация
│   │   ├── cron/         # Парсинг новостей
│   │   ├── news/         # Новости
│   │   └── telegram/     # Telegram API
│   ├── auth/             # Страницы авторизации
│   └── page/             # Главная страница
├── features/              # Бизнес-фичи
│   ├── subscriptions/    # Подписки на каналы
│   ├── groups/           # Группы каналов
│   └── telegram-parser/  # Парсер Telegram
├── widgets/              # UI компоненты
│   ├── sidebar/          # Боковая панель
│   ├── news-card/        # Карточки новостей
│   └── wallpaper/        # Фон приложения
├── shared/               # Общие утилиты
│   ├── api/              # API клиенты
│   ├── lib/              # Утилиты (PocketBase, хелперы)
│   └── ui/               # Переиспользуемые UI компоненты
├── entities/             # Бизнес-сущности
├── types/                # Глобальные типы TypeScript
└── scripts/              # Скрипты запуска
```

## Установка и запуск

### Требования

- Node.js 20.x LTS
- PocketBase (локально или на сервере)

### Установка

```bash
# Клонирование репозитория
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
# Режим разработки
npm run dev

# Production сборка
npm run build
npm start

# Запуск парсера вручную
npm run parse:run
```

## Переменные окружения

| Переменная                | Описание                | Пример                  |
| ------------------------- | ----------------------- | ----------------------- |
| `POCKETBASE_URL`          | URL PocketBase          | `http://127.0.0.1:8090` |
| `PB_ADMIN_EMAIL`          | Email админа PocketBase | `admin@example.com`     |
| `PB_ADMIN_PASSWORD`       | Пароль админа           | `password`              |
| `TELEGRAM_API_ID`         | Telegram API ID         | `123456`                |
| `TELEGRAM_API_HASH`       | Telegram API Hash       | `abc123...`             |
| `TELEGRAM_SESSION_STRING` | Сессия Telegram         | `AwAA...`               |
| `CRON_SECRET`             | Секрет для cron         | `secret123`             |
| `POST_LIMIT`              | Лимит постов с канала   | `3`                     |

## API Endpoints

### Аутентификация

| Метод | Путь                         | Описание             |
| ----- | ---------------------------- | -------------------- |
| POST  | `/api/auth/register`         | Регистрация          |
| POST  | `/api/auth/login`            | Вход                 |
| POST  | `/api/auth/logout`           | Выход                |
| GET   | `/api/auth/me`               | Текущий пользователь |
| GET   | `/api/auth/oauth/[provider]` | OAuth вход           |

### Новости

| Метод | Путь                   | Описание             |
| ----- | ---------------------- | -------------------- |
| GET   | `/api/news`            | Получение новостей   |
| GET   | `/api/cron/fetch-news` | Запуск парсера (SSE) |

### Файлы

| Метод | Путь                   | Описание           |
| ----- | ---------------------- | ------------------ |
| GET   | `/api/files/[...path]` | Прокси медиафайлов |

## База данных (PocketBase)

### Коллекции

| Коллекция       | Описание               |
| --------------- | ---------------------- |
| `users`         | Пользователи           |
| `news`          | Новости из Telegram    |
| `subscriptions` | Подписки пользователей |
| `groups`        | Группы каналов         |
| `media`         | Медиафайлы             |

### Схема news

| Поле        | Тип  | Описание            |
| ----------- | ---- | ------------------- |
| title       | text | Заголовок           |
| content     | text | Текст новости       |
| source      | text | Источник (@channel) |
| url         | text | Ссылка на оригинал  |
| publishedAt | date | Дата публикации     |

### Схема media

| Поле   | Тип      | Описание                   |
| ------ | -------- | -------------------------- |
| newsId | relation | Связь с новостью           |
| file   | file     | Медиафайл                  |
| type   | text     | Тип (photo/video/document) |
| order  | number   | Порядок в альбоме          |
| width  | number   | Ширина                     |
| height | number   | Высота                     |

## Деплой

### Vercel (Frontend)

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Деплой произойдёт автоматически

### Сервер (PocketBase)

```bash
# Скачайте PocketBase
wget https://github.com/pocketbase/pocketbase/releases/latest/pocketbase_*.zip
unzip pocketbase_*.zip

# Запуск
./pocketbase serve
```

## Команды

```bash
npm run dev              # Dev сервер
npm run build            # Production сборка
npm run lint             # Линтинг
npm run parse:run        # Запуск парсера
npm test                 # Unit тесты
npm run test:e2e         # E2E тесты
```

---

## TODO: Нереализованный функционал

- **Подтверждение email** — требуется настройка SMTP в PocketBase
- **Лимит медиафайлов** — автоматическая очистка при превышении лимита
- **Профиль пользователя** — страница существует, функционал не реализован
- **Тесты** — многие тесты требуют доработки

---

## Лицензия

MIT
