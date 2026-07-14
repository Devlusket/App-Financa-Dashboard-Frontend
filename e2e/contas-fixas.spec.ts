import { expect, test } from "@playwright/test";

test("cria, atualiza e exclui uma conta fixa", async ({ page }) => {
  const usuario = process.env.E2E_USUARIO;
  const senha = process.env.E2E_SENHA;
  const suffix = Date.now();
  const categoriaNome = `Categoria conta E2E ${suffix}`;
  const contaNome = `Conta E2E ${suffix}`;

  test.skip(!usuario || !senha, "Defina E2E_USUARIO e E2E_SENHA para testar o CRUD real.");

  await page.goto("/login");
  await page.getByLabel("Usuário").fill(usuario!);
  await page.getByLabel("Senha").fill(senha!);
  await page.getByRole("button", { name: "Entrar" }).click();

  await page.getByRole("link", { name: "Categorias", exact: true }).click();
  await page.getByRole("button", { name: /Nova categoria|Criar primeira categoria/ }).click();
  await page.getByLabel("Nome").fill(categoriaNome);
  await page.getByRole("button", { name: "Criar categoria" }).click();
  await expect(page.getByText(categoriaNome, { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Contas fixas", exact: true }).click();
  await page.getByRole("button", { name: /Nova conta fixa|Criar primeira conta/ }).click();
  await page.getByLabel("Nome da conta").fill(contaNome);
  await page.getByLabel("Categoria vinculada").click();
  await page.getByRole("option", { name: categoriaNome }).click();
  await page.getByLabel("Valor atual").fill("125.50");
  await page.getByRole("button", { name: "Criar conta fixa" }).click();

  await expect(page.getByText(contaNome, { exact: true })).toBeVisible();
  await expect(page.getByText("R$ 125,50", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Editar valor" }).click();
  await page.getByLabel(`Novo valor de ${contaNome}`).fill("189.90");
  await page.getByRole("button", { name: "Salvar valor" }).click();
  await expect(page.getByText("R$ 189,90", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: `Excluir ${contaNome}` }).click();
  await page.getByRole("button", { name: "Excluir conta" }).click();
  await expect(page.getByText(contaNome, { exact: true })).toHaveCount(0);

  await page.getByRole("link", { name: "Categorias", exact: true }).click();
  await page.getByRole("button", { name: `Excluir ${categoriaNome}` }).click();
  await page.getByRole("button", { name: "Excluir categoria" }).click();
  await expect(page.getByText(categoriaNome, { exact: true })).toHaveCount(0);
});
