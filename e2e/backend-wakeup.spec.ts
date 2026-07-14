import { expect, test } from "@playwright/test";

test("explica visualmente quando o backend está inicializando", async ({ page }) => {
  test.setTimeout(20_000);
  await page.route("**/auth/login", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 8_000));
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ mensagem: "Credenciais de teste inválidas." }),
    });
  });

  await page.goto("/login");
  await page.getByLabel("Usuário").fill("teste-inicializacao");
  await page.getByLabel("Senha").fill("teste-inicializacao");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByRole("status", { name: "Inicializando o sistema" })).toBeVisible();
  await expect(page.getByText("Conectando ao servidor")).toBeVisible();
  await expect(page.getByText("O servidor está despertando")).toBeVisible({ timeout: 8_000 });
  await page.screenshot({ path: "/tmp/financa-backend-wakeup.png" });

  await expect(page.getByRole("status", { name: "Inicializando o sistema" })).toBeHidden({ timeout: 5_000 });
  await expect(page.getByText("Credenciais de teste inválidas.", { exact: true })).toBeVisible();
});
