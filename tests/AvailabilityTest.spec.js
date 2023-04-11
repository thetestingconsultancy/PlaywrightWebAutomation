const { test, expect } = require("@playwright/test");
// // shift + option + F pretty format
const { AvailabilityPage } = require("../pages/AvailabilityPage");
const { NavigationPage } = require("../pages/NavigationPage");
const login = require("./helper/login");

test.describe("Availablity Test", () => {
  let context;
  let page;
  let availabilityPage;
  let navigationPage;
  test.beforeAll(async ({ browser }) => {
    const browserObj = await login(browser);
    context = browserObj.context;
    page = browserObj.page;
    availabilityPage = new AvailabilityPage(page);
    navigationPage = new NavigationPage(page);
  });

  test.beforeEach(async () => {
    await page.goto("/");
    await navigationPage.goToAvailabilityScreen();
    await availabilityPage.deleteAvailabilityEntries();
  });

  test.afterEach(async ({ browser }, testInfo) => {
    console.log(`Finished ${testInfo.title} with status ${testInfo.status}`);
    if (testInfo.status === "failed") {
      const screenshot = await page.screenshot({
        fullPage: true,
      });
      await testInfo.attach(" - Full Screen Capture on Failure - ", {
        body: screenshot,
        contentType: "image/png",
      });
    }
  });
  
  test("TC 0001: Create new availability entry and delete it", async () => {
    await availabilityPage.createAndDeleteAvailabilityEntry();
  });

  test("TC 49386: Create new availability repeat entry for 10 days and delete it", async () => {
    await availabilityPage.createAndDeleteRepeatAvailabilityEntry(
      "Every 10 Days"
    );
  });

  test("TC 25441: Availability - Desktop - Create a calendar entry on behalf of a brigade member", async () => {
    await availabilityPage.createAndDeleteAvailabilityEntryOnBehalfMember();
  });

  test("TC 49881: Create a calendar entry maximum of 5 years future date", async () => {
    await availabilityPage.createMaximumFutureDateEntry();
  });

  test("TC 49403: Create new availability repeat entry for 3 weeks and delete it", async () => {
    await availabilityPage.createAndDeleteRepeatAvailabilityEntry(
      "Every 3 Weeks"
    );
  });

  test("TC 49465: Create new availability repeat entry for 3 weeks and set end date beyond 3 weeks", async () => {
    await availabilityPage.createEntryBeyondThreeWeeks();
  });
});
