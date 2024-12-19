const { test, expect } = require('@playwright/test');
const { getTrpcClient }= require('./../util/trpc');
const { getAuthToken } = require('./../util/auth');

async function login(page) {
  await page.goto("https://recipesage.com");
  await page
    .getByRole("button", { name: "Log In" })
    .first()
    .click({ force: true });

  await page.waitForSelector('input[type="email"]', { state: "visible" });
  await page.fill('input[type="email"]', 'upurtova2@gmail.com');

  await page.fill('input[type="password"]', process.env.TEST_PASSWORD);

  const loginSubmitButton = await page.getByRole("button", {
    name: "Log In",
  });
  await loginSubmitButton.click();
  const myRecipesTitle = await page.locator('ion-title:has-text("My Recipes")');
  await expect(myRecipesTitle).toBeVisible();
}

test.describe("Authentication", () => {
  test("Login test", async ({ page }) => {
    await page.goto("https://recipesage.com");
    await page
      .getByRole("button", { name: "Log In" })
      .first()
      .click({ force: true });

    // this helps see ALL buttons on the page
    //   await page.getByRole('button')
    //     .click();

    // await page.getByText("LOG IN").click();

    await page.waitForSelector('input[type="email"]', { state: "visible" });
    await page.fill('input[type="email"]', "upurtova2@gmail.com");

    await page.fill('input[type="password"]', process.env.TEST_PASSWORD);

    const loginSubmitButton = await page.getByRole("button", {
      name: "Log In",
    });
    await loginSubmitButton.click();

    const myRecipesTitle = await page.locator(
      'ion-title:has-text("My Recipes")',
    );
    await expect(myRecipesTitle).toBeVisible();
  });

  test("Login test with incorrect or empty password", async ({ page }) => {
    await page.goto("https://recipesage.com");
    await page
      .getByRole("button", { name: "Log In" })
      .first()
      .click({ force: true });

    await page.waitForSelector('input[type="email"]', { state: "visible" });
    await page.waitForSelector('input[type="password"]', {
      state: "visible",
    });

    const loginSubmitButton = await page.getByRole("button", {
      name: "Log In",
    });
    await loginSubmitButton.click();

    const errorMessage = await page.locator("text=Please enter a password.");
    await expect(errorMessage).toBeVisible();

    const myRecipesTitle = await page.locator(
      'ion-title:has-text("My Recipes")',
    );
    await expect(myRecipesTitle).not.toBeVisible();

    await page.waitForSelector('input[type="email"]', { state: "visible" });
    await page.fill('input[type="email"]', "upurtova2@gmail.com");

    await page.fill('input[type="password"]', "incorrectpassword");

    await page.getByRole("button", {
      name: "Log In",
    });
    await loginSubmitButton.click();
    const errorMessage2 = await page.locator(
      "text=It looks like that email or password isn't correct.",
    );
    await expect(errorMessage2).toBeVisible();

    await expect(myRecipesTitle).not.toBeVisible();
  });

  test("Logout test", async ({ page }) => {
    // SETUP
    await login(page);

    // ACTION
    await page
      .getByRole("button", {
        name: "menu",
      })
      .first()
      .click();

    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: "Settings" }).click({ force: true });

    await page.waitForLoadState("networkidle");
    // await page.screenshot({ path: 'debug-before-logout.png' });
    const button = await page
      .getByRole("button", { name: "Log Out" })
      .click({ force: true });

    // EXPECT
    const mainTitle = await page.getByText("All of your recipes in one place");
    await expect(mainTitle).toBeVisible();
  });
});
