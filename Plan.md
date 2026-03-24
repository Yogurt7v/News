# ПЛАН ДЕПЛОЯ: stay-informed.ru

## Сервер
- **IP:** 5.53.125.238
- **SSH:** port 22, user root
- **ОС:** Ubuntu 22.04
- **RAM:** 454MB (осторожно с потреблением!)

---

## ЭТАП 1: Подготовка сервера

### 1.1 Создать папки
```bash
mkdir -p /var/www/stay-informed/{releases,logs}
mkdir -p /opt/pocketbase
```

### 1.2 Установить PostgreSQL
```bash
apt update
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql
```

### 1.3 Настроить PostgreSQL
```bash
# Создать пользователя и базу
sudo -u postgres psql -c "CREATE USER news_admin WITH PASSWORD 'G7kL9pQ2rX8vF4mN';"
sudo -u postgres psql -c "CREATE DATABASE news_aggregator OWNER news_admin;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE news_aggregator TO news_admin;"
```

---

## ЭТАП 2: Установка PocketBase

### 2.1 Скачать PocketBase
```bash
cd /opt/pocketbase
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.22/pocketbase_0.22.22_linux_amd64.zip
unzip pocketbase_*.zip
chmod +x pocketbase
```

### 2.2 Создать systemd сервис
```bash
nano /etc/systemd/system/pocketbase.service
```

```ini
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/pocketbase
ExecStart=/opt/pocketbase/pocketbase serve --http=127.0.0.1:8090
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable pocketbase
systemctl start pocketbase
```

---

## ЭТАП 3: Настройка Nginx

### 3.1 Создать конфиг
```bash
nano /etc/nginx/sites-available/stay-informed
```

```nginx
upstream nextjs {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name 5.53.125.238;
    
    # Next.js
    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # PocketBase API
    location /api/pb/ {
        proxy_pass http://127.0.0.1:8090/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # PocketBase Admin UI
    location /_/ {
        proxy_pass http://127.0.0.1:8090/_/;
        proxy_set_header Host $host;
    }
}
```

### 3.2 Активировать конфиг
```bash
ln -s /etc/nginx/sites-available/stay-informed /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## ЭТАП 4: Деплой Next.js

### 4.1 Создать deploy.sh
```bash
nano /var/www/stay-informed/deploy.sh
```

```bash
#!/bin/bash
set -e

RELEASE_DIR="/var/www/stay-informed/releases/$(date +%Y%m%d_%H%M%S)"
mkdir -p $RELEASE_DIR

echo "Copying files to $RELEASE_DIR..."
cp -r /tmp/deploy/* $RELEASE_DIR/

echo "Installing dependencies..."
cd $RELEASE_DIR
npm ci --production

echo "Building..."
npm run build

echo "Switching symlink..."
ln -sfn $RELEASE_DIR /var/www/stay-informed/current

echo "Restarting PM2..."
pm2 restart news-app || pm2 start /var/www/stay-informed/current/node_modules/.bin/next start --name news-app -- --port 3000

echo "Cleaning old releases..."
cd /var/www/stay-informed/releases && ls -1t | tail -n +4 | xargs -r rm -rf

echo "Done!"
```

```bash
chmod +x /var/www/stay-informed/deploy.sh
```

### 4.2 Создать .env файл на сервере
```bash
nano /var/www/stay-informed/.env
```

```
NODE_ENV=production
DATABASE_URL=postgresql://news_admin:G7kL9pQ2rX8vF4mN@localhost:5432/news_aggregator
POCKETBASE_URL=http://127.0.0.1:8090
PB_ADMIN_EMAIL=egorov-2k@yandex.ru
PB_ADMIN_PASSWORD=Yogurt152070
TELEGRAM_API_ID=30639646
TELEGRAM_API_HASH=08e0fad08062e9bf7d312a3c906b392e
TELEGRAM_BOT_TOKEN=8601187397:AAH_jNlDZMuAyE4Wg63NpOUyjPvnczOd03A
TELEGRAM_CHANNELS=grpzdc,bomber_fighter
CRON_SECRET=CXf1mnRi012uFB0HaiNIgUTbfdATHx4t14aVJgPK0mI=
```

---

## ЭТАП 5: GitHub Actions

### 5.1 Создать GitHub Secrets
В GitHub репозитории → Settings → Secrets → Actions:
- `SERVER_HOST` = `5.53.125.238`
- `SERVER_USER` = `root`
- `SERVER_PASSWORD` = `buujo6rn0t`

### 5.2 Создать workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Create archive
        run: tar -czf /tmp/deploy.tar.gz .next node_modules package.json package-lock.json

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          password: ${{ secrets.SERVER_PASSWORD }}
          port: 22
          script: |
            mkdir -p /tmp/deploy
            tar -xzf /tmp/deploy.tar.gz -C /tmp/deploy
            cd /var/www/stay-informed && bash deploy.sh
```

---

## ЭТАП 6: Первый деплой

### 6.1 Запустить вручную
```bash
# На сервере:
cd /var/www/stay-informed
mkdir -p releases
```

### 6.2 Запушить изменения
```bash
git add .
git commit -m "Add deployment config"
git push origin main
```

---

## Порядок выполнения

| Шаг | Действие | Команды на сервере |
|-----|----------|-------------------|
| 1 | Подготовка папок | `mkdir -p ...` |
| 2 | Установить PostgreSQL | `apt install postgresql` |
| 3 | Настроить БД | `sudo -u postgres psql ...` |
| 4 | Установить PocketBase | `wget + unzip` |
| 5 | Настроить Nginx | `nano /etc/nginx/...` |
| 6 | Создать deploy.sh | `nano deploy.sh` |
| 7 | Создать GitHub Actions | `.github/workflows/...` |
| 8 | Запустить PocketBase | `systemctl start pocketbase` |
| 9 | Деплой | `git push` |

---

## Структура на сервере после деплоя

```
/var/www/stay-informed/
├── current/              → симлинк на текущую версию
├── releases/
│   └── 20240101_120000/  ← версии
├── logs/
├── .env
└── deploy.sh

/opt/pocketbase/
├── pocketbase           ← бинарник
└── pb_data/            ← SQLite база PocketBase
```

## Схема работы

```
                            5.53.125.238
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                 80, 443         8090          3000
                    │              │              │
                    ▼              ▼              ▼
                ┌───────┐    ┌───────────┐   ┌───────────┐
                │ Nginx │───▶│ PocketBase│   │  Next.js │
                │Proxy  │    │  (OAuth)  │   │  (SSR)   │
                └───────┘    └───────────┘   └───────────┘
                                       │
                                       ▼
                                ┌───────────┐
                                │ PostgreSQL│
                                └───────────┘
```
