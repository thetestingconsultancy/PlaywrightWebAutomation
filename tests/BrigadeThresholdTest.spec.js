const { test, expect } = require("@playwright/test");
const login = require("./helper/login");
const { ThresholdPage } = require("../pages/ThresholdPage");
const { ContactPage } = require("../pages/ContactPage");
const { NavigationPage } = require("../pages/NavigationPage");
const { HomePage } = require("../pages/HomePage");

test.describe("Brigade Threshold Test", () => {
  let context;
  let page;
  let navigationPage;
  let thresholdPage;
  let contactPage;
  let homePage;
  test.beforeAll(async ({ browser }) => {
    const browserObj = await login(browser);
    context = browserObj.context;
    page = browserObj.page;
    navigationPage = new NavigationPage(page);
    homePage = new HomePage(page);
    thresholdPage = new ThresholdPage(page);
    contactPage = new ContactPage(page);
  });

  test.beforeEach(async () => {
    // Prerequisite Setup
    await homePage.closeAllIncidentsInProgress();
    await navigationPage.goToThresholdScreen();
    await thresholdPage.deleteAllBrigadeThresholdsAndRules();
    await thresholdPage.deleteAllIncidentThresholdsAndRules();
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

  // Brigade Threshold Tests start here

  test("TC 35100 35102 36134: Create and delete brigade threshold with delay rule", async () => {
    await thresholdPage.addNewBrigadeThreshold({
      doNotContact: false,
      peopleWithStatus: ["Available"],
    });
  });

  test("TC 35101: For Brigade Threshold, Standby member counts as Available", async () => {
    await navigationPage.goToContactScreen();
    await contactPage.changeStatusTo({
      status: "Unavailable",
      member: "AutoTest Flight 200",
    });
    await page.waitForTimeout(1000);
    await navigationPage.goToThresholdScreen();
    await thresholdPage.addNewBrigadeThreshold({
      brigadeOperationalMemberCount: 10,
      doNotContact: false,
      peopleWithStatus: ["Available"],
    });
    const thresholdShortageCount1 =
      await thresholdPage.getThresholdShortageCount();
    await page.waitForTimeout(2000);
    await navigationPage.goToContactScreen();
    await contactPage.changeStatusTo({
      status: "Standby",
      member: "AutoTest Flight 200",
    });
    await page.waitForTimeout(2000);
    const thresholdShortageCount2 =
      await thresholdPage.getThresholdShortageCount();
    await expect(Number(thresholdShortageCount1)).toBeGreaterThan(
      Number(thresholdShortageCount2)
    );

    await page.waitForTimeout(1000);
    await navigationPage.goToContactScreen();
    await contactPage.changeStatusTo({
      status: "Unavailable",
      member: "AutoTest Flight 200",
    });
  });

  test("TC 35103: Threshold should break when user change their status to unavailable", async () => {
    await navigationPage.goToContactScreen();
    await contactPage.changeStatusTo({
      status: "Standby",
      member: "AutoTest Flight 200",
    });
    await navigationPage.goToThresholdScreen();
    await thresholdPage.addNewBrigadeThreshold({
      brigadeOperationalMemberCount: 10,
      doNotContact: false,
      peopleWithStatus: ["Available"],
    });
    const thresholdShortageCount1 =
      await thresholdPage.getThresholdShortageCount();
    await navigationPage.goToContactScreen();
    await contactPage.changeStatusTo({
      status: "Unavailable",
      member: "AutoTest Flight 200",
    });
    await page.waitForTimeout(2000);
    const thresholdShortageCount2 =
      await thresholdPage.getThresholdShortageCount();
    await expect(Number(thresholdShortageCount2)).toBeGreaterThan(
      Number(thresholdShortageCount1)
    );
  });

  test("TC 35104: Create threshold with immediate break/Escalation", async () => {
    await thresholdPage.addNewBrigadeThreshold({
      OnImmediateBreak: true,
      peopleWithStatus: ["Available"],
    });
  });

  test('TC 39562: User should not receive  multiple notifications when "Do not send to anyone who has  already been contacted for the threshold breach "is enabled and user changes their status.', async () => {
    await thresholdPage.addNewBrigadeThreshold({
      OnImmediateBreak: true,
      doNotContact: true,
      peopleWithStatus: ["Unavailable"],
    });
    await navigationPage.goToContactScreen();
    await contactPage.changeStatusTo({
      status: "Unavailable",
      member: "AutoTest Flight 195",
    });

    await page.waitForTimeout(1000);
    await navigationPage.goToContactScreen();
    await contactPage.changeStatusTo({
      status: "Available",
      member: "AutoTest Flight 195",
    });
  });

  test('TC 39563: User should receive multiple notification when "Do not send to anyone who has already been contacted for the threshold breach" is disabled and user changes their status.', async () => {
    await navigationPage.goToContactScreen();
    // prerequisite setup - default value
    await contactPage.changeStatusTo({
      status: "Available",
      member: "AutoTest Flight 195",
    });

    // starting test
    await navigationPage.goToThresholdScreen();
    await thresholdPage.addNewBrigadeThreshold({
      OnImmediateBreak: true,
      doNotContact: false,
      peopleWithStatus: ["Unavailable"],
    });

    await page.waitForTimeout(2000);

    const thresholdShortageCount1 =
      await thresholdPage.getThresholdShortageCount();
    await navigationPage.goToContactScreen();
    await contactPage.changeStatusTo({
      status: "Unavailable",
      member: "AutoTest Flight 195",
    });
    await page.waitForTimeout(2000);
    const thresholdShortageCount2 =
      await thresholdPage.getThresholdShortageCount();
    console.log(thresholdShortageCount1, thresholdShortageCount2);
    expect(Number(thresholdShortageCount2)).toBeGreaterThan(
      Number(thresholdShortageCount1)
    );

    await page.waitForTimeout(1000);
    await navigationPage.goToContactScreen();
    await contactPage.changeStatusTo({
      status: "Available",
      member: "AutoTest Flight 195",
    });
  });

  test('TC 39565: When "Only contact people with skills that meet the shortage" is disabled ,then all users should receive notification.', async () => {
    await navigationPage.goToContactScreen();
    await contactPage.changeStatusTo({
      status: "Available",
      member: "AutoTest Flight 195",
    });
    await navigationPage.goToThresholdScreen();
    await thresholdPage.addNewBrigadeThreshold({
      onlyContactPeopleWithSkill: false,
      OnImmediateBreak: true,
      doNotContact: false,
      peopleWithStatus: ["Unavailable"],
    });
    const thresholdShortageCount1 =
      await thresholdPage.getThresholdShortageCount();
    await navigationPage.goToContactScreen();
    await contactPage.changeStatusTo({
      status: "Unavailable",
      member: "AutoTest Flight 195",
    });
    await page.waitForTimeout(2000);
    const thresholdShortageCount2 =
      await thresholdPage.getThresholdShortageCount();
    await expect(Number(thresholdShortageCount2)).toBeGreaterThan(
      Number(thresholdShortageCount1)
    );
    await page.waitForTimeout(1000);
    await navigationPage.goToContactScreen();
    await contactPage.changeStatusTo({
      status: "Available",
      member: "AutoTest Flight 195",
    });
  });

  test('TC 39564: When "Only contact people with skills that meet the shortage" is enabled ,then only people who have the attribute should receive notification.', async () => {
    // meeting prerequisite
    await navigationPage.goToContactScreen();
    await contactPage.changeStatusTo({
      status: "Available",
      member: "AutoTest Flight 195",
    });
    // test starts here
    await navigationPage.goToThresholdScreen();
    await thresholdPage.addNewBrigadeThreshold({
      onlyContactPeopleWithSkill: true,
      OnImmediateBreak: true,
      doNotContact: false,
      peopleWithStatus: ["Unavailable"],
    });
    const thresholdShortageCount1 =
      await thresholdPage.getThresholdShortageCount();
    await navigationPage.goToContactScreen();
    await contactPage.changeStatusTo({
      status: "Unavailable",
      member: "AutoTest Flight 195",
    });
    await page.waitForTimeout(2000);
    const thresholdShortageCount2 =
      await thresholdPage.getThresholdShortageCount();
    console.log(thresholdShortageCount1, thresholdShortageCount2);
    await expect(Number(thresholdShortageCount2)).toBeGreaterThan(
      Number(thresholdShortageCount1)
    );

    await page.waitForTimeout(1000);
    await navigationPage.goToContactScreen();
    await contactPage.changeStatusTo({
      status: "Available",
      member: "AutoTest Flight 195",
    });
  });

  // Brigade Threshold Tests end here
});
