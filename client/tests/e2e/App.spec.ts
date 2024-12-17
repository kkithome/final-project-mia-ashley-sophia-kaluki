import { expect, test } from "@playwright/test";
// import { clearUser } from "../../src/utils/api";
import { setupClerkTestingToken, clerk } from "@clerk/testing/playwright";

/**
  The general shapes of tests in Playwright Test are:
    1. Navigate to a URL
    2. Interact with the page
    3. Assert something about the page against your expectations
  Look for this pattern in the tests below!
 */

/**
 * Don't worry about the "async" yet. We'll cover it in more detail
 * for the next sprint. For now, just think about "await" as something
 * you put before parts of your test that might take time to run,
 * like any interaction with the page.
 */
// test("on page load, I see the gearup screen and skip auth.", async ({
//   page,
// }) => {
//   // Notice: http, not https! Our front-end is not set up for HTTPs.
//   await page.goto("http://localhost:8000/");
//   await expect(page.getByLabel("Gearup Title")).toBeVisible();
//   // <i> with aria-label favorite-words-header should include the SPOOF_UID
//   await expect(page.getByLabel("user-header")).toContainText(SPOOF_UID);
// });

// test("I can add a word to my favorites list", async ({ page }) => {
//   await page.goto("http://localhost:8000/");
//   // - get the <p> elements inside the <ul> with aria-label="favorite-words"
//   const favoriteWords = await page.getByLabel("favorite-words");
//   await expect(favoriteWords).not.toContainText("hello");

//   await page.getByLabel("word-input").fill("hello");
//   await page.getByLabel("add-word-button").click();

//   const favoriteWordsAfter = await page.getByLabel("favorite-words");
//   await expect(favoriteWordsAfter).toContainText("hello");

//   // .. and this works on refresh
//   await page.reload();
//   const favoriteWordsAfterReload = await page.getByLabel("favorite-words");
//   await expect(favoriteWordsAfterReload).toContainText("hello");
// });

// Test: User can log in successfully
test('user can log in and log out successfully', async ({ page }) => {
  await page.goto('http://localhost:8000/');
  await page.getByRole('img', { name: 'A bear' }).click();
  await page.getByLabel('Page Title').click();
  await page.locator('div').filter({ hasText: /^SIGN UP$/ }).click();
  await page.getByPlaceholder('Enter your email address').click();
  await page.getByPlaceholder('Enter your email address').fill('slg4963@gmail.com');
  await page.getByPlaceholder('Enter your password').click();
  await page.getByPlaceholder('Enter your password').fill('hjhkhjk');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByPlaceholder('Enter your email address').click();
  await page.getByPlaceholder('Enter your email address').fill('team@baist.ai');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByPlaceholder('Enter your password').click();
  await page.getByPlaceholder('Enter your password').click();
  await page.getByPlaceholder('Enter your password').fill('hjhkhjkhjhjhj');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
});

// testing for error message when a non-brown.edu user tries to create an account 
test('testing for error message when a non-brown.edu user tries to create an account', async ({ page }) => {
await page.getByPlaceholder('Enter your email address').fill('team@baist.ai');
await page.getByPlaceholder('Enter your password').click();
await page.getByPlaceholder('Enter your password').fill('testingpasswordjkjkj');
await page.getByPlaceholder('Enter your password').click();
await page.getByRole('button', { name: 'Continue', exact: true }).click();
await page.getByText('You do not have permission to').click();
});


// test("login/logout", async ({ page }) => {
//   setupClerkTestingToken({ page });
//   await page.goto("http://localhost:8000/");
//   await clerk.loaded({ page });
//   // Check that the Sign In button is visible initially
//   const loginButton = page.getByRole("button", { name: "Sign in" });
//   await expect(loginButton).toBeVisible();
//   // Sign in using test credentials
//   await clerk.signIn({
//     page,
//     signInParams: {
//       strategy: "password",
//       password: process.env.E2E_CLERK_USER_PASSWORD!,
//       identifier: process.env.E2E_CLERK_USER_USERNAME!,
//     },
//   });
//   // Log out after signing in
//   await clerk.signOut({ page });
// });

// // Test: Check if the main elements of the page are visible after login
// test("page elements visible", async ({ page }) => {
//   setupClerkTestingToken({ page });
//   await page.goto("http://localhost:8000/");
//   await clerk.loaded({ page });

//   // Verify the Sign In button is visible
//   const loginButton = page.getByRole("button", { name: "Sign in" });
//   await expect(loginButton).toBeVisible();

//   // Sign in
//   await clerk.signIn({
//     page,
//     signInParams: {
//       strategy: "password",
//       password: process.env.E2E_CLERK_USER_PASSWORD!,
//       identifier: process.env.E2E_CLERK_USER_USERNAME!,
//     },
//   });

//   // Check visibility of key elements on the page after signing in
//   await expect(page.getByLabel("Page Title")).toBeVisible();
//   await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
//   // await expect(page.getByText("Current User:")).toBeVisible();
//   // await expect(page.getByText("Current User:alice@example.")).toBeVisible(); // commented out for non-mock version
//   await expect(page.getByRole("button", { name: "Clear My Pins" })).toBeVisible();
//   await expect(page.getByLabel("Map", { exact: true })).toBeVisible();
// });

// // Test: Switch between multiple users and verify each user's pins
// test("mock switch between users", async ({ page }) => {
//   setupClerkTestingToken({ page });
//   await page.goto("http://localhost:8000/");
//   await clerk.loaded({ page });
//   const loginButton = page.getByRole("button", { name: "Sign in" });
//   await expect(loginButton).toBeVisible();

//   await clerk.signIn({
//     page,
//     signInParams: {
//       strategy: "password",
//       password: process.env.E2E_CLERK_USER_PASSWORD!,
//       identifier: process.env.E2E_CLERK_USER_USERNAME!,
//     },
//   });

//   // Drop pins for Alice
//   await page.getByLabel("Map", { exact: true }).click({
//     position: {
//       x: 589,
//       y: 348,
//     },
//   });
//   await page.getByLabel("Map", { exact: true }).click({
//     position: {
//       x: 646,
//       y: 307,
//     },
//   });
//   await expect(
//     page.getByRole("img", { name: "map marker" }).nth(1)
//   ).toBeVisible();

//   await expect(
//     page.getByRole("img", { name: "map marker" }).nth(3)
//   ).toBeVisible();  

//   // Switch to Charlie and drop pins
//   await page.getByRole("combobox").selectOption("charlie@example.com");
//   await page.getByLabel("Map", { exact: true }).click({
//     position: {
//       x: 718,
//       y: 323,
//     },
//   });
//   await page.getByLabel("Map", { exact: true }).click({
//     position: {
//       x: 703,
//       y: 380,
//     },
//   });
//   await expect(page.locator("#root")).toContainText("alice");
//   await expect(page.locator("#root")).toContainText("charlie");
// })

// // Test: Each user can clear their pins and the display updates accordingly
// test("clearing pins", async ({ page }) => {
//   setupClerkTestingToken({ page });
//   await page.goto("http://localhost:8000/");
//   await clerk.loaded({ page });
//   const loginButton = page.getByRole("button", { name: "Sign in" });
//   await expect(loginButton).toBeVisible();

//   await clerk.signIn({
//     page,
//     signInParams: {
//       strategy: "password",
//       password: process.env.E2E_CLERK_USER_PASSWORD!,
//       identifier: process.env.E2E_CLERK_USER_USERNAME!,
//     },
//   });

//   // Sign in as Alice, add pins, then switch users and add more pins
//   await page.getByLabel("Map", { exact: true }).click({
//     position: {
//       x: 589,
//       y: 348,
//     },
//   });
//   await page.getByLabel("Map", { exact: true }).click({
//     position: {
//       x: 646,
//       y: 307,
//     },
//   });

//   // Switch to Charlie
//   await page.getByRole("combobox").selectOption("charlie@example.com");
//   await page.getByLabel("Map", { exact: true }).click({
//     position: {
//       x: 718,
//       y: 323,
//     },
//   });
//   await page.getByLabel("Map", { exact: true }).click({
//     position: {
//       x: 703,
//       y: 380,
//     },
//   });
//   await expect(page.locator("#root")).toContainText("alice");
//   await expect(page.locator("#root")).toContainText("charlie");

//   // Clear Charlie's pins
//   await expect(page.locator("#root")).toContainText("Total Pins: 4My Pins: 2");
//   await page.getByRole("button", { name: "Clear My Pins" }).click();
//   await expect(page.locator("#root")).toContainText("Total Pins: 2My Pins: 0");
// });

// // Test: Pins created by multiple users persist across sessions
// test("multiple users and persistence", async ({ page }) => {
//   setupClerkTestingToken({ page });
//   await page.goto("http://localhost:8000/");
//   await clerk.loaded({ page });
//   const loginButton = page.getByRole("button", { name: "Sign in" });
//   await expect(loginButton).toBeVisible();

//   await clerk.signIn({
//     page,
//     signInParams: {
//       strategy: "password",
//       password: process.env.E2E_CLERK_USER_PASSWORD!,
//       identifier: process.env.E2E_CLERK_USER_USERNAME!,
//     },
//   });

//   // Sign in as Alice, Charlie, and Emma, each adding pins, and verify the count
//   await page.getByLabel("Map", { exact: true }).click({
//     position: {
//       x: 663,
//       y: 311,
//     },
//   });
//   await page.getByLabel("Map", { exact: true }).click({
//     position: {
//       x: 606,
//       y: 406,
//     },
//   });

//   // Switch to Charlie
//   await page.getByRole("combobox").selectOption("charlie@example.com");
//   await page.getByLabel("Map", { exact: true }).click({
//     position: {
//       x: 607,
//       y: 341,
//     },
//   });
//   await page.getByLabel("Map", { exact: true }).click({
//     position: {
//       x: 716,
//       y: 379,
//     },
//   });

//   // Switch to Emma
//   await page.getByRole("combobox").selectOption("emma@example.com");
//   await page.getByLabel("Map", { exact: true }).click({
//     position: {
//       x: 646,
//       y: 448,
//     },
//   });
//   await page.getByLabel("Map", { exact: true }).click({
//     position: {
//       x: 728,
//       y: 303,
//     },
//   });

//   // Check pins amount
//   await expect(page.locator("#root")).toContainText("Total Pins: 6My Pins: 2");
  
//   // Switch back to Alice and clear pins, checking for the right amount
//   await page.getByRole("combobox").selectOption("alice@example.com");
//   await page.getByRole("button", { name: "Clear My Pins" }).click();
//   await expect(page.locator("#root")).toContainText("Total Pins: 4My Pins: 0");

// });

// // Test: Drag and drop functionality within the map
// test("drag and drop", async ({ page }) => {
//   setupClerkTestingToken({ page });
//   await page.goto("http://localhost:8000/");
//   await clerk.loaded({ page });
//   const loginButton = page.getByRole("button", { name: "Sign in" });
//   await expect(loginButton).toBeVisible();

//   await clerk.signIn({
//     page,
//     signInParams: {
//       strategy: "password",
//       password: process.env.E2E_CLERK_USER_PASSWORD!,
//       identifier: process.env.E2E_CLERK_USER_USERNAME!,
//     },
//   });

//   const source_element = page.getByLabel("Map", { exact: true });
//   const target_element = page.getByLabel("Page Title");

//   await source_element.dragTo(target_element);
// })

