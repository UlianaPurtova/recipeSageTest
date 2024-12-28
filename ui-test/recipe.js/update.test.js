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

test.describe("Update", () => {

  test("Update recipe title", async ({ page }) => {
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
   
    
    
    
    await login(page);

    await page.locator("#main-content img").click();

    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Edit" }).click();

    await page.waitForLoadState("networkidle");
    const inputLoc = page.locator('label div:has-text("Title") + div input');
    await expect(inputLoc).toBeVisible();
    await inputLoc.waitFor({ state: 'visible' });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await inputLoc.evaluate((input) => (input.value = ""));
    await inputLoc.fill("Lobster stew", { force: true });

    await page.screenshot({ path: 'screenshot.png' });
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForLoadState("networkidle");

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
});
