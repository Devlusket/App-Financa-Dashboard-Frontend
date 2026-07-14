import { expect, test } from "@playwright/test";

test("entra, navega pelas páginas protegidas e sai", async ({ page }) => {
  const usuario = process.env.E2E_USUARIO;
  const senha = process.env.E2E_SENHA;

  test.skip(!usuario || !senha, "Defina E2E_USUARIO e E2E_SENHA para testar o login real.");

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("Usuário").fill(usuario!);
  await page.getByLabel("Senha").fill(senha!);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  for (const pageName of ["Categorias", "Contas fixas", "Renda", "Relatórios"]) {
    await page.getByRole("link", { name: pageName, exact: true }).click();
    await expect(page.getByRole("heading", { name: pageName, exact: true })).toBeVisible();
  }

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});
