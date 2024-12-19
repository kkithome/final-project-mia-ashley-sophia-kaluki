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

// testing that a brown.edu user can authenticate
// TODO: add logout button 
test("test a brown.edu user can authenticate", async ({ page }) => {
  await page.goto("http://localhost:8000/");
  await page.getByRole("button", { name: "LOG IN" }).click();
  await page.getByPlaceholder("Enter your email address").click();
  await page
    .getByPlaceholder("Enter your email address")
    .fill("sophia_lloyd_george@brown.edu");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  expect(page.locator('div').filter({ hasText: /^LOG OUT$/ }).first());
});

// // testing for error message when a non-brown.edu user tries to create an account
test('testing for error message when a non-brown.edu user tries to create an account', async ({ page }) => {
  await page.goto('http://localhost:8000/');
  await page.goto('http://localhost:8000/');
  await page.getByRole('button', { name: 'SIGN UP' }).click();
  await page.getByPlaceholder('Enter your email address').click();
  await page.getByPlaceholder('Enter your email address').fill('team@baist.ai');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  expect(page.getByText('You do not have permission to'));
});

// testing that keyword search for bee shows one event
test('keyword search for "bee" shows one event', async ({ page }) => {
  await page.goto('http://localhost:8000/');
  await page.locator('div').filter({ hasText: /^LOG IN$/ }).click();
  await page.getByPlaceholder('Enter your email address').click();
  await page.getByPlaceholder('Enter your email address').fill('student_one@brown.edu');
  await page.getByPlaceholder('Enter your email address').press('Enter');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByPlaceholder('Enter your password').click();
  await page.getByPlaceholder('Enter your password').fill('studentone123');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('link', { name: 'Search... Search Icon' }).click();
  await page.getByPlaceholder('Enter keyword').click();
  await page.getByPlaceholder('Enter keyword').fill('bee');
  await page.getByRole('button', { name: 'Submit Search' }).click();
  await page.getByRole('heading', { name: 'Brown Bee Coffee' }).click();
  await expect(page.getByRole('heading', { name: 'Brown Bee Coffee' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Brown Bee Coffee' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to main' }).click();
  await expect(page.getByText('Brown Bee CoffeeA rare gem')).toBeVisible();
});

// testing that visual elements are appearing properly on the activity finder page
test("check visual elements are appearing properly on the activity finder page", async ({
  page,
}) => {
  await page.goto('http://localhost:8000/');
  await page.locator('div').filter({ hasText: /^LOG IN$/ }).click();
  await page.getByPlaceholder('Enter your email address').click();
  await page.getByPlaceholder('Enter your email address').fill('student_one@brown.edu');
  await page.getByPlaceholder('Enter your email address').press('Enter');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByPlaceholder('Enter your password').click();
  await page.getByPlaceholder('Enter your password').fill('studentone123');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText("Bear Tracks")).toBeVisible();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Bear Tracks$/ })
      .getByRole("img")
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Search... Search Icon" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "User Profile" })
  ).toBeVisible();
  await expect(page.getByLabel("Open user button")).toBeVisible();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^LOG OUT$/ })
      .nth(1)
  ).toBeVisible();
  await expect(page.getByText("Search...User ProfileBrown")).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Brown Bee Coffee" })
  ).toBeVisible();
  await expect(page.getByText("Brown Bee CoffeeA rare gem")).toBeVisible();
  await expect(page.getByText("A rare gem nestled in the")).toBeVisible();
  await expect(page.locator("div:nth-child(4)").first()).toBeVisible();
  await expect(page.locator("button:nth-child(3)").first()).toBeVisible();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^404 Benefit St, Providence, RI 02903$/ })
  ).toBeVisible();
  await expect(page.getByText(":00am - 3:00pm")).toBeVisible();
  await expect(page.getByText("Open Thursday-Monday")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Page Title" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
  await expect(page.getByLabel("Map", { exact: true })).toBeVisible();
  await expect(page.getByText("© 2024 Mia Nguyen, Kaluki")).toBeVisible();
});

// testing that two events are filtered by category and keyword 
test("filter events by a category (i.e. arts) and a keyword ", async ({
  page,
}) => {
  await page.goto('http://localhost:8000/');
  await page.locator('div').filter({ hasText: /^LOG IN$/ }).click();
  await page.getByPlaceholder('Enter your email address').click();
  await page.getByPlaceholder('Enter your email address').fill('student_one@brown.edu');
  await page.getByPlaceholder('Enter your email address').press('Enter');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByPlaceholder('Enter your password').click();
  await page.getByPlaceholder('Enter your password').fill('studentone123');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('link', { name: 'Search... Search Icon' }).click();
  await page.getByPlaceholder('Enter keyword').click();
  await page.getByPlaceholder('Enter keyword').fill('sculpture');
  await page.locator('select[name="eventCategory"]').selectOption('arts');
  await page.getByRole('button', { name: 'Submit Search' }).click();
  expect(page.getByRole('heading', { name: 'WaterFire Providence' })); 
  await page.getByRole('link', { name: 'Search... Search Icon' }).click();
  await page.getByPlaceholder('Enter keyword').click();
  await page.getByPlaceholder('Enter keyword').fill('museum');
  await page.locator('select[name="eventCategory"]').selectOption('arts');
  await page.getByRole('button', { name: 'Submit Search' }).click();
  expect(page.getByRole('heading', { name: 'Rhode Island School of Design' }));
});

// // testing that clicking going increases attendance by 1
test("clicking going increases attendance by 1", async ({ page }) => {
  await page.goto('http://localhost:8000/');
  await page.locator('div').filter({ hasText: /^LOG IN$/ }).click();
  await page.getByPlaceholder('Enter your email address').click();
  await page.getByPlaceholder('Enter your email address').fill('student_one@brown.edu');
  await page.getByPlaceholder('Enter your email address').press('Enter');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByPlaceholder('Enter your password').click();
  await page.getByPlaceholder('Enter your password').fill('studentone123');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByText('0 Attending').nth(1).click();
  await page.locator('div:nth-child(6) > div:nth-child(4) > button:nth-child(2)').click();
  await page.goto('http://localhost:8000/');
  //await page.locator('div:nth-child(6) > div:nth-child(4) > button:nth-child(2)').click();
  await page.getByRole('button', { name: 'Checked Going', exact: true }).click();
  expect(page.getByText('1 Attending'))
});

// // testing that favoriting an event adds it to the user profile favorited events list
test("favoriting event adds it to the user profile favorited events list", async ({
  page,
}) => {
  await page.goto('http://localhost:8000/');
  await page.locator('div').filter({ hasText: /^LOG IN$/ }).click();
  await page.getByPlaceholder('Enter your email address').click();
  await page.getByPlaceholder('Enter your email address').fill('student_one@brown.edu');
  await page.getByPlaceholder('Enter your email address').press('Enter');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByPlaceholder('Enter your password').click();
  await page.getByPlaceholder('Enter your password').fill('studentone123');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.locator('div:nth-child(2) > div:nth-child(4) > button:nth-child(3)').click();
  await page.getByRole('button', { name: 'User Profile' }).click();
  expect(page.getByText('Historic Federal Hill').first());
  await page.getByRole('button', { name: 'Back to Main' }).click();
  await page.locator('div:nth-child(2) > div:nth-child(4) > button:nth-child(3)').click();
});

// testing that search with keyword 'coffee' yields brown bee coffee
test("testing that search with keyword coffee yields brown bee coffee", async ({
  page,
}) => {
  await page.goto('http://localhost:8000/');
  await page.locator('div').filter({ hasText: /^LOG IN$/ }).click();
  await page.getByPlaceholder('Enter your email address').click();
  await page.getByPlaceholder('Enter your email address').fill('student_one@brown.edu');
  await page.getByPlaceholder('Enter your email address').press('Enter');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByPlaceholder('Enter your password').click();
  await page.getByPlaceholder('Enter your password').fill('studentone123');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('link', { name: 'Search... Search Icon' }).click();
  await page.getByPlaceholder("Enter keyword").click();
  await page.getByPlaceholder("Enter keyword").fill("coffee");
  await page.getByRole("button", { name: "Submit Search" }).click();
  expect(page.getByRole("heading", { name: "Brown Bee Coffee" })); 
});

// testing that a page description and event fields are displayed when a user clicks on an activity
test("test that page description and event fields are displayed when a user clicks on an activity", async ({ page }) => {
  await page.goto('http://localhost:8000/');
  await page.locator('div').filter({ hasText: /^LOG IN$/ }).click();
  await page.getByPlaceholder('Enter your email address').click();
  await page.getByPlaceholder('Enter your email address').fill('student_one@brown.edu');
  await page.getByPlaceholder('Enter your email address').press('Enter');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByPlaceholder('Enter your password').click();
  await page.getByPlaceholder('Enter your password').fill('studentone123');
  await page.getByRole('button', { name: 'Continue' }).click();
  expect(page.getByRole('heading', { name: 'India Point Park' })); 
  expect(page.getByText('India Point Park is a park in'));
  expect(page.getByText('Date: Every Day')); 
  expect(page.getByText('Time: 6:00am'));
  expect(page.getByRole('img', { name: 'India Point Park' })); 
});

// // testing that the key visual elements (bear images, headers, map) appear on the login page
test("testing for key visual elements on login page", async ({ page }) => {
  await page.goto('http://localhost:8000/');
  expect(page.getByRole('img', { name: 'A bear' })); 
  expect(page.getByLabel('Page Title')); 
  await page.getByRole('button', { name: 'SIGN UP' }).click();
  await page.goto('http://localhost:8000/');
  await page.locator('div').filter({ hasText: /^LOG IN$/ }).click();
  expect(page.getByText('© 2024 Mia Nguyen, Kaluki'));
});

// test that a narrower search (using the on-campus filter, museum keyword, and address) yields RISD museum
test("test that a narrower search (using the on-campus filter, museum keyword, and address) yields RISD museum", async ({ page }) => {
    await page.goto('http://localhost:8000/');
    await page.locator('div').filter({ hasText: /^LOG IN$/ }).click();
    await page.getByPlaceholder('Enter your email address').click();
    await page.getByPlaceholder('Enter your email address').fill('student_one@brown.edu');
    await page.getByPlaceholder('Enter your email address').press('Enter');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByPlaceholder('Enter your password').click();
    await page.getByPlaceholder('Enter your password').fill('studentone123');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('link', { name: 'Search... Search Icon' }).click();
  await page.getByPlaceholder('Enter keyword').click();
await page.getByPlaceholder('Enter keyword').fill('museum');
await page.locator('div').filter({ hasText: /^On-Campus$/ }).locator('label').click();
await page.locator('select[name="time"]').selectOption('morning');
await page.getByPlaceholder('Enter location').click();
await page.getByPlaceholder('Enter location').fill('20 North Main Street Providence, RI');
await page.getByRole('button', { name: 'Submit Search' }).click();
expect(page.getByRole('heading', { name: 'Rhode Island School of Design' })); 
}); 

//TODO: search test with a filter by date (December 31st)



