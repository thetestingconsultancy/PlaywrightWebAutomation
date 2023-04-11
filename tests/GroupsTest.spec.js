const { test, expect } = require("@playwright/test");
// // shift + option + F pretty format
const { GroupsPage } = require("../pages/GroupsPage");
const { NavigationPage } = require("../pages/NavigationPage");
const login = require("./helper/login");

test.describe("Groups Test", () => {
  let context;
  let page;
  let groupsPage;
  let navigationPage;
  test.beforeAll(async ({ browser }) => {
    const browserObj = await login(browser);
    context = browserObj.context;
    page = browserObj.page;
    groupsPage = new GroupsPage(page);
    navigationPage = new NavigationPage(page);
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

  test("TC 25482: Groups - Desktop - Create a Dynamic groups and delete it", async () => {
    await navigationPage.goToGroupsScreen();
    await groupsPage.createAndDeleteDynamicGroup();
  });

  test("TC 25486: Groups - Desktop - Create a Static groups and delete it", async () => {
    await navigationPage.goToGroupsScreen();
    await groupsPage.createAndDeleteStaticGroup();
  });
});
