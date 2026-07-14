import { expect, test } from "@playwright/test";

test("cria, edita e exclui uma categoria percentual", async ({ page }) => {
  const usuario = process.env.E2E_USUARIO;
  const senha = process.env.E2E_SENHA;
  const nomeInicial = `Categoria E2E ${Date.now()}`;
  const nomeEditado = `${nomeInicial} editada`;

  test.skip(!usuario || !senha, "Defina E2E_USUARIO e E2E_SENHA para testar o CRUD real.");

  await page.goto("/login");
  await page.getByLabel("Usuário").fill(usuario!);
  await page.getByLabel("Senha").fill(senha!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.getByRole("link", { name: "Categorias", exact: true }).click();

  await page.getByRole("button", { name: /Nova categoria|Criar primeira categoria/ }).click();
  await page.getByLabel("Nome").fill(nomeInicial);
  await page.getByLabel("Regra de divisão").click();
  await page.getByRole("option", { name: "Percentuais personalizados" }).click();
  await page.getByLabel("Hyany").fill("40");
  await page.getByLabel("Lucas").fill("60");
  await page.getByRole("button", { name: "Criar categoria" }).click();

  await expect(page.getByText(nomeInicial, { exact: true })).toBeVisible();
  await expect(page.getByText("Hyany 40% · Lucas 60%", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: `Editar ${nomeInicial}` }).click();
  await page.getByLabel("Nome").fill(nomeEditado);
  await page.getByLabel("Regra de divisão").click();
  await page.getByRole("option", { name: "100% de uma pessoa" }).click();
  await page.getByLabel("Pessoa responsável").click();
  await page.getByRole("option", { name: "Lucas", exact: true }).click();
  await page.getByRole("switch", { name: "Categoria de poupança" }).click();
  await page.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByText(nomeEditado, { exact: true })).toBeVisible();
  await expect(page.getByText("Lucas 100%", { exact: true })).toBeVisible();
  await expect(page.getByText("Poupança", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: `Excluir ${nomeEditado}` }).click();
  await page.getByRole("button", { name: "Excluir categoria" }).click();
  await expect(page.getByText(nomeEditado, { exact: true })).toHaveCount(0);
});
