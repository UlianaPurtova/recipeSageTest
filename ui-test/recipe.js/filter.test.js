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

test.describe("Filter", () => {
  test("filter by rating", async ({ page }) => {
    // SETUP
    const token = await getAuthToken(
      "upurtova2@gmail.com",
      process.env.TEST_PASSWORD
    );

    const trpc = await getTrpcClient(token);

    const recipe = await trpc.recipes.createRecipe.mutate({
      title: "GUM",
      description: "all about gum",
      yield: "0",
      folder: "main",
      activeTime: "0",
      totalTime: "0",
      source: "my brain",
      url: "http/fhrjlk.ss",
      notes: "none",
      ingredients: "none",
      instructions: "none",
      rating: 3,
      labelIds: [],
      imageIds: [],
    });

    const recipe2 = await trpc.recipes.createRecipe.mutate({
      title: "Candy",
      description: "all about gum",
      yield: "0",
      folder: "main",
      activeTime: "0",
      totalTime: "0",
      source: "my brain",
      url: "http/fhrjlk.ss",
      notes: "none",
      ingredients: "none",
      instructions: "none",
      rating: 5,
      labelIds: [],
      imageIds: [],
    });

    await login(page);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Filter" }).click();

    const filter = await page.getByText("Filter by Rating");
    await expect(filter).toBeVisible();
    await expect(filter).toBeEnabled();
    await filter.click();

    await page.waitForLoadState("networkidle");
    const reset = await page.getByText("RESET");
    await expect(reset).toBeVisible();

    const rating = await page.locator('[id="ion-cb-3"]');
    await rating.click();// add force true

    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Okay" }).click();


 });
});
