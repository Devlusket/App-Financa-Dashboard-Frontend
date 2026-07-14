import { expect, test } from "@playwright/test";

test("consulta renda por pessoa e mês sem criar dados", async ({ page }) => {
  const usuario = process.env.E2E_USUARIO;
  const senha = process.env.E2E_SENHA;

  test.skip(!usuario || !senha, "Defina E2E_USUARIO e E2E_SENHA para testar a consulta real.");

  await page.goto("/login");
  await page.getByLabel("Usuário").fill(usuario!);
  await page.getByLabel("Senha").fill(senha!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.getByRole("link", { name: "Renda", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Renda", exact: true })).toBeVisible();
  await page.getByLabel("Pessoa").click();
  await page.getByRole("option", { name: "Lucas", exact: true }).click();
  await page.getByLabel("Mês de referência").fill("2025-01");

  await expect(page.getByText("Renda fixa de Lucas", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Cadastrar renda do mês|Atualizar renda fixa/ })).toBeVisible();
  await expect(page.getByText("Rendas adicionais", { exact: true })).toBeVisible();
});
