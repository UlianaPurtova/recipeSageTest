const { test, expect } = require("@playwright/test");
const { getTrpcClient } = require("../util/trpc");
const { getAuthToken } = require("../util/auth");

async function login(page) {
  await page.goto("https://recipesage.com");
  await page
    .getByRole("button", { name: "Log In" })
    .first()
    .click({ force: true });

  await page.waitForSelector('input[type="email"]', { state: "visible" });
  await page.fill('input[type="email"]', "upurtova2@gmail.com");

  await page.fill('input[type="password"]', process.env.TEST_PASSWORD);

  const loginSubmitButton = await page.getByRole("button", {
    name: "Log In",
  });
  await loginSubmitButton.click();
  const myRecipesTitle = await page.locator('ion-title:has-text("My Recipes")');
  await expect(myRecipesTitle).toBeVisible();
}

test.describe("Create", () => {
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

    const autofillButton = page.getByRole("button", { name: "Autofill recipe from..." });
    await expect(autofillButton).toBeVisible();
    await expect(autofillButton).toBeEnabled();
    await autofillButton.click();

    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: "Autofill from URL" })
      .click({ force: true });
    await page.waitForLoadState("networkidle");
    await page.fill(
      'input[placeholder="Recipe URL"]',
      "https://www.bbc.co.uk/food/apple"
    );

    const okayButton = await page.getByRole("button", { name: "Okay" });
    await expect(okayButton).toBeVisible();
    await okayButton.click({ force: true });
    await page.waitForLoadState("networkidle");
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await page.mouse.click(100, 500); // page renders badly in PR, this helps
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.getByRole("button", { name: "Create" }).click({ force: true });
    const recipeTitle = await page.getByRole("heading", {
      name: "Apple Recipes",
    });
    await expect(recipeTitle).toBeVisible();
  });

  test("Create recipe with autofill text", async ({ page }) => {
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
    const autofillButton = page.getByRole("button", { name: "Autofill from text" });
    await expect(autofillButton).toBeVisible();
    await expect(autofillButton).toBeEnabled();
    await autofillButton.click();
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
        "Cauliflower cheese by Jenny White A simple and delicious cauliflower cheese recipe a classic comfort food. This also makes a wonderful accompaniment to a vegetarian roast. Each serving provides 313 kcal, 12.7g protein, 15.5g carbohydrate (of which 7.2g sugars), 21.8 fat (of which 13.2g saturates), 2.3 fibre and 0.85 salt."
      );
    await page.getByRole("button", { name: "Okay" }).click({ force: true });
    await page.waitForLoadState("networkidle");
    // await new Promise((resolve) => setTimeout(resolve, 20000));
    await page.getByRole("button", { name: "Create" }).waitFor({ state: "visible" });
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
      process.env.TEST_PASSWORD
    );

    const trpc = await getTrpcClient(token);

    const recipes = await trpc.recipes.getRecipes.query({
      limit: 50,
      folder: "main",
      orderBy: "title",
      orderDirection: "asc",
      offset: 0,
    });

    for (const recipe of recipes.recipes) {
      try {
        await trpc.recipes.deleteRecipe.mutate({
          id: recipe.id,
        });
      } catch (error) {
        console.error(`Failed to delete recipe with ID: ${recipe.id}`, error);
      }
    }
  });
});
