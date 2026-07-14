import { expect, test } from "@playwright/test";

test("dashboard alterna visão e gerencia um lançamento", async ({ page }) => {
  test.setTimeout(60_000);
  const usuario = process.env.E2E_USUARIO;
  const senha = process.env.E2E_SENHA;
  const suffix = Date.now();
  const categoriaNome = `Categoria dashboard E2E ${suffix}`;
  const descricao = `Lançamento E2E ${suffix}`;
  const descricaoEditada = `${descricao} editado`;

  test.skip(!usuario || !senha, "Defina E2E_USUARIO e E2E_SENHA para testar o Dashboard real.");

  await page.goto("/login");
  await page.getByLabel("Usuário").fill(usuario!);
  await page.getByLabel("Senha").fill(senha!);
  await page.getByRole("button", { name: "Entrar" }).click();

  await page.getByRole("link", { name: "Categorias", exact: true }).click();
  await page.getByRole("button", { name: /Nova categoria|Criar primeira categoria/ }).click();
  await page.getByLabel("Nome").fill(categoriaNome);
  await page.getByRole("button", { name: "Criar categoria" }).click();
  await expect(page.getByRole("dialog", { name: "Nova categoria" })).toBeHidden({ timeout: 15_000 });

  await page.getByRole("link", { name: "Dashboard", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Seu dinheiro, com clareza." })).toBeVisible();
  await page.getByRole("button", { name: "Individual" }).click();
  await expect(page.getByLabel("Pessoa")).toHaveText(/Hyany|Lucas/);
  await expect(page.getByLabel("Pessoa")).not.toHaveText(/[0-9a-f]{8}-[0-9a-f-]{27,}/i);
  await page.getByRole("button", { name: "Casa" }).click();

  await page.getByRole("button", { name: "Novo lançamento" }).click();
  await page.getByLabel("Descrição").fill(descricao);
  await page.getByLabel("Categoria").click();
  await page.getByRole("option", { name: categoriaNome }).click();
  await page.getByLabel("Valor").fill("240");
  await page.getByLabel("Quem pagou").click();
  await page.getByRole("option", { name: "Lucas", exact: true }).click();
  await page.getByRole("button", { name: "Criar lançamento" }).click();

  await expect(page.getByText(descricao, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Pendente. Alterar para Pago" }).click();
  await expect(page.getByRole("button", { name: "Pago. Alterar para Pendente" })).toBeVisible();

  await page.getByRole("button", { name: `Editar ${descricao}` }).click();
  await page.getByLabel("Descrição").fill(descricaoEditada);
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByText(descricaoEditada, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: `Excluir ${descricaoEditada}` }).click();
  await page.getByRole("button", { name: "Excluir lançamento" }).click();
  await expect(page.getByText(descricaoEditada, { exact: true })).toHaveCount(0);

  await page.getByRole("link", { name: "Categorias", exact: true }).click();
  await page.getByRole("button", { name: `Excluir ${categoriaNome}` }).click();
  await page.getByRole("button", { name: "Excluir categoria" }).click();
  await expect(page.getByRole("button", { name: `Excluir ${categoriaNome}` })).toHaveCount(0);
});

test("dashboard não causa overflow na viewport mobile", async ({ page }) => {
  const usuario = process.env.E2E_USUARIO;
  const senha = process.env.E2E_SENHA;
  test.skip(!usuario || !senha, "Defina E2E_USUARIO e E2E_SENHA para testar o Dashboard mobile.");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByLabel("Usuário").fill(usuario!);
  await page.getByLabel("Senha").fill(senha!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "Seu dinheiro, com clareza." })).toBeVisible();
  await expect(page.getByText("Faturas por pessoa")).toBeVisible();

  const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  await page.waitForTimeout(1_000);
  await page.screenshot({ path: "/tmp/financa-dashboard-mobile.png", fullPage: true });
});
