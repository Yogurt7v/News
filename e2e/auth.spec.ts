import { test, expect } from '@playwright/test';

test('Yandex login button redirects to Yandex OAuth', async ({ page }) => {
  await page.goto('http://localhost:3000/auth/signin');

  // Нажимаем кнопку Yandex
  await page.click('button:has-text("Войти через Яндекс")');

  // Проверяем, что произошёл редирект на домен yandex.ru
  await expect(page).toHaveURL(/accounts\.yandex\.ru|oauth\.yandex\.ru/);
});

// test('should navigate to register page and register', async ({ page }) => {
//   await page.goto('/auth/register');
//   await page.fill('input[name="name"]', 'Test User');
//   await page.fill('input[name="email"]', 'test@example.com');
//   await page.fill('input[name="password"]', 'password123');
//   await page.fill('input[name="confirmPassword"]', 'password123');
//   await page.click('button[type="submit"]');

//   await expect(page).toHaveURL(/\/auth\/signin/);
// });
