// import { test, expect } from "@playwright/test";
// import { getTrpcClient } from "./../util/trpc";
// import { getAuthToken } from "./../util/auth";
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
  await page.fill('input[type="email"]', process.env.TEST_PASSWORD);

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

  test("Create recipe test", async ({ page }) => {
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
    await page
      .getByRole("link", { name: "Create Recipe" })
      .click({ force: true });

    await page.waitForLoadState("networkidle");
    // await page.fill('input[type="title"]', "Lobster stew");
    await page
      .locator('label div:has-text("Title") + div input')
      .fill("Lobster stew");

    await page.getByRole("button", { name: "Create" }).click();
    await page.waitForLoadState("networkidle");
    // EXPECT
    const created = await page.getByText("Created");
    await expect(created).toBeVisible();
  });

  test("Delete recipe test", async ({ page }) => {
    // SETUP
    await login(page);

    // ACTION
    await page.locator("#main-content img").click();

    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Delete" }).click();

    page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Delete" }).click();
    // // EXPECT
    const deleted = await page.getByText("Welcome to RecipeSage!");
    await expect(deleted).toBeVisible();
  });

  test("Create recipe with autofill url", async ({ page }) => {
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
    await page
      .getByRole("link", { name: "Create Recipe" })
      .click({ force: true });

    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Autofill recipe from..." }).click();
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: "Autofill from URL" })
      .click({ force: true });
    await page.waitForLoadState("networkidle");
    await page.fill(
      'input[placeholder="Recipe URL"]',
      "https://www.bbc.co.uk/food/apple",
    );

    await page.getByRole("button", { name: "Okay" }).click({ force: true });
    await page.waitForLoadState("networkidle");
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await page.getByRole("button", { name: "Create" }).click();
    const recipeTitle = await page.getByRole("heading", {
      name: "Apple Recipes",
    });
    await expect(recipeTitle).toBeVisible();
  });

  test("Create recipe with autofill text", async ({ page }) => {
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
    await page
      .getByRole("link", { name: "Create Recipe" })
      .click({ force: true });

    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Autofill recipe from..." }).click();
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: "Autofill from text" })
      .click({ force: true });
    await page.waitForLoadState("networkidle");
    await page
      .locator("div")
      .filter({
        hasText:
          "Autofill recipe from block of textEnter a block of text with a recipe somewhere",
      })
      .locator("div")
      .nth(3);

    await page
      .getByPlaceholder("Text that includes recipe...")
      .fill(
        "Cauliflower cheese by Jenny White A simple and delicious cauliflower cheese recipe a classic comfort food. This also makes a wonderful accompaniment to a vegetarian roast. Each serving provides 313 kcal, 12.7g protein, 15.5g carbohydrate (of which 7.2g sugars), 21.8 fat (of which 13.2g saturates), 2.3 fibre and 0.85 salt.",
      );
    await page.getByRole("button", { name: "Okay" }).click({ force: true });
    await page.waitForLoadState("networkidle");
    await new Promise((resolve) => setTimeout(resolve, 20000));
    await page.getByRole("button", { name: "Create" }).click();
    const recipeTitle = await page.getByRole("heading", {
      name: "Cauliflower Cheese",
    });
    await expect(recipeTitle).toBeVisible();
  });

  test("test remove recipes api", async ({ page }) => {
    // SETUP
    const token = await getAuthToken(
      "upurtova2@gmail.com",
      process.env.TEST_PASSWORD,
    );

    const trpc = await getTrpcClient(token);
      
    const recipes = await trpc.recipes.getRecipes.query({
      limit: 50,
      folder: "main",
      orderBy: "title",
      orderDirection: "asc",
      offset: 0,
    });
    console.log(recipes);
  });
});
