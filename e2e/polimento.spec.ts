import { expect, test } from "@playwright/test";

test("valida login e mantém todas as telas dentro da viewport mobile", async ({ page }) => {
  const usuario = process.env.E2E_USUARIO;
  const senha = process.env.E2E_SENHA;
  test.skip(!usuario || !senha, "Defina E2E_USUARIO e E2E_SENHA para a revisão mobile.");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Informe seu usuário.")).toBeVisible();
  await expect(page.getByText("Informe sua senha.")).toBeVisible();
  await page.screenshot({ path: "/tmp/financa-login-mobile.png", fullPage: true });

  await page.getByLabel("Usuário").fill(usuario!);
  await page.getByLabel("Senha").fill(senha!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  for (const route of ["dashboard", "categorias", "contas-fixas", "renda", "relatorios"]) {
    await page.goto(`/${route}`);
    await expect(page.locator("h1")).toBeVisible();
    const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(dimensions.document, `overflow horizontal em /${route}`).toBeLessThanOrEqual(dimensions.viewport);
  }

  await page.goto("/endereco-inexistente");
  await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
});
