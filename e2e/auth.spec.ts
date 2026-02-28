import { test, expect } from '@playwright/test';

test('should register a new user and login', async ({ page }) => {
  const email = `test${Date.now()}@example.com`;
  const password = 'password123';

  // Переход на страницу регистрации
  await page.goto('/auth/register');

  // Заполнение формы
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);
  await page.click('button[type="submit"]');

  // Ожидание редиректа на страницу входа
  await expect(page).toHaveURL(/\/auth\/signin/);
  // Можно проверить наличие сообщения об успешной регистрации, если оно есть
  // Например, если в URL есть параметр ?registered=true
  await expect(page).toHaveURL(/.*registered=true/);

  // Заполнение формы входа (предполагаем, что на странице signin есть форма с name="email" и name="password")
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]:has-text("Войти")');

  // Ожидание редиректа на главную
  await expect(page).toHaveURL('/');

  // Проверка, что на странице профиля отображается email
  await page.goto('/profile');
  await expect(page.locator(`text=${email}`)).toBeVisible();
});

test('should show error on wrong password', async ({ page }) => {
  const email = `test${Date.now()}@example.com`;
  const password = 'password123';

  // Сначала регистрируем пользователя
  await page.goto('/auth/register');
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/auth\/signin/);

  // Пытаемся войти с неверным паролем
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'wrong');
  await page.click('button[type="submit"]:has-text("Войти")');

  // Проверяем, что URL содержит ошибку (NextAuth добавляет параметр error)
  await expect(page).toHaveURL(/.*error=CredentialsSignin/);
  // Или проверяем наличие сообщения об ошибке на странице (если оно выводится)
  // await expect(page.locator('text=Неверный email или пароль')).toBeVisible();
});
