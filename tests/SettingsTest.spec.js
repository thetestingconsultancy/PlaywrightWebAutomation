const { test, expect } = require("@playwright/test");
// // shift + option + F pretty format
const { SettingsPage } = require("../pages/SettingsPage");
const { NavigationPage } = require("../pages/NavigationPage");
const { HomePage } = require("../pages/HomePage");
const login = require("./helper/login");

test.describe("Setting Test", () => {
  let context;
  let page;
  let settingsPage;
  let navigationPage;
  let homePage;
  test.beforeAll(async ({ browser }) => {
    const browserObj = await login(browser);
    context = browserObj.context;
    page = browserObj.page;
    settingsPage = new SettingsPage(page);
    navigationPage = new NavigationPage(page);
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

  test("TC 26291 36289: Deactivate and activate member again", async () => {
    await homePage.closeAllIncidentsInProgress();

    await navigationPage.goToSettingScreen();
    await settingsPage.deactivateAndActivateMember();
  });

  test("TC 36290 36287: Activate member using employee id and delete member", async () => {
    await homePage.closeAllIncidentsInProgress();

    await navigationPage.goToSettingScreen();
    await settingsPage.activateAndDeleteMember();
  });

  test("TC 25400: User Profile - Desktop - Deactivate Device", async () => {
    await navigationPage.goToSettingScreen();
    const { deviceName } = await settingsPage.activateDevice();
    await settingsPage.deactivateAndDeleteDevice({
      deviceName,
      isDeviceActivated: false,
    });
  });

  test("TC 25421: Brigade Members - Disable all notifications", async () => {
    await navigationPage.goToSettingScreen();
    await settingsPage.changeNotificationsForBrigadeMember({
      disableAll: false,
    }); // Prerequisite - unchecking disable all notification
    await settingsPage.changeNotificationsForBrigadeMember({
      disableAll: true,
    }); // Test
    await settingsPage.changeNotificationsForBrigadeMember({
      disableAll: false,
    }); // Cleanup - unchecking disable all notification
  });
});
