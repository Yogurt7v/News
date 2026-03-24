#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"

$server = "5.53.125.238"
$user = "root"
$remotePath = "/var/www/news"

Write-Host "=== Local Build & Deploy ===" -ForegroundColor Cyan

Write-Host "[1/5] Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "[2/5] Creating archive..." -ForegroundColor Yellow
$archivePath = "$env:TEMP\news-deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').tar.gz"
tar -czf $archivePath --exclude='.next/cache' .next node_modules package.json package-lock.json

Write-Host "[3/5] Transferring to server..." -ForegroundColor Yellow
scp -i ~/.ssh/id_ed25519 $archivePath "${user}@${server}:/tmp/deploy.tar.gz"

Write-Host "[4/5] Extracting and installing on server..." -ForegroundColor Yellow
ssh -i ~/.ssh/id_ed25519 $user@$server @"
cd $remotePath
rm -rf .next node_modules
tar -xzf /tmp/deploy.tar.gz -C $remotePath
npm ci --production
pm2 restart news || pm2 start npm --name news -- start
rm /tmp/deploy.tar.gz
"@

Write-Host "[5/5] Testing..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
$response = Invoke-WebRequest -Uri "https://be-informed.ru" -TimeoutSec 10 -UseBasicParsing -ErrorAction SilentlyContinue

if ($response.StatusCode -eq 200) {
    Write-Host "SUCCESS! Site is live: https://be-informed.ru" -ForegroundColor Green
} else {
    Write-Host "Site may need more time to start. Check manually." -ForegroundColor Yellow
}

Write-Host "Done!" -ForegroundColor Cyan
