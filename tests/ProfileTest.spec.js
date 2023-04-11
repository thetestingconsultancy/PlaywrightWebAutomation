const { test, expect } = require("@playwright/test");
// // shift + option + F pretty format
const { NavigationPage } = require("../pages/NavigationPage");
const { ProfilePage } = require("../pages/ProfilePage");
const { HomePage } = require("../pages/HomePage");

const login = require("./helper/login");

test.describe("Profile Test", () => {
  let context;
  let page;
  let navigationPage;
  let profilePage;
  let homePage;
  test.beforeAll(async ({ browser }) => {
    const browserObj = await login(browser);
    context = browserObj.context;
    page = browserObj.page;
    navigationPage = new NavigationPage(page);
    profilePage = new ProfilePage(page);
    homePage = new HomePage(page);
  });

  test.beforeEach(async () => {
    await page.goto("/");
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

  test("TC 25396: User Profile - Desktop - Enter custom message", async () => {
    await navigationPage.goToProfileScreen();
    await page.waitForTimeout(500);
    const { message, userName } =
      await profilePage.setCustomMessageInputValue();
    await navigationPage.goToHomeScreen();
    await homePage.validateMessageForContact(userName, message);

    //cleanup
    await navigationPage.goToProfileScreen();
    await page.waitForTimeout(500);
    await profilePage.resetCustomMessageInputValue();
  });

  test("TC 25404: User Profile - Desktop - Turn on disable all notifications", async () => {
    await navigationPage.goToProfileScreen();
    await profilePage.disableAllNotifications(false); // Prerequisite - unchecking disable all notification
    await profilePage.disableAllNotifications(true);
    await profilePage.disableAllNotifications(false); // Cleanup - unchecking disable all notification
  });
});
