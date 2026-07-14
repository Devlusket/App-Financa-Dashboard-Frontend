import { expect, test } from "@playwright/test";

test("consulta relatório histórico por casa e pessoa", async ({ page }) => {
  const usuario = process.env.E2E_USUARIO;
  const senha = process.env.E2E_SENHA;
  test.skip(!usuario || !senha, "Defina E2E_USUARIO e E2E_SENHA para testar Relatórios.");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByLabel("Usuário").fill(usuario!);
  await page.getByLabel("Senha").fill(senha!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.getByRole("link", { name: "Relatórios", exact: true }).click();
  await page.getByLabel("Mês de referência").fill("2025-01");

  await expect(page.getByRole("heading", { name: "Relatórios" })).toBeVisible();
  await expect(page.getByText("Comparativo por pessoa")).toBeVisible();
  await expect(page.getByRole("cell", { name: "Hyany", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Lucas", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Casa", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Individual" }).click();
  await page.getByLabel("Pessoa").click();
  await page.getByRole("option", { name: "Lucas", exact: true }).click();
  await expect(page.getByText("Responsabilidade de Lucas.")).toBeVisible();

  const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
});
