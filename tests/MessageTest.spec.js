const { test, expect } = require("@playwright/test");
const { MessagePage } = require("../pages/MessagePage");
const { NavigationPage } = require("../pages/NavigationPage");
const { HomePage } = require("../pages/HomePage");
const login = require("./helper/login");

test.describe("Message Test", () => {
  let context;
  let page;
  let messagePage;
  let navigationPage;
  let homePage;
  test.beforeAll(async ({ browser }) => {
    const browserObj = await login(browser);
    context = browserObj.context;
    page = browserObj.page;
    homePage = new HomePage(page);
    messagePage = new MessagePage(page);
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

  test("TC 25502: Desktop as Brigade Member - Create & delete new message and verify whether its deleted", async () => {
    await navigationPage.goToMessageScreen();
    await messagePage.createAndSendNewmessage("Brigade Admins", "No");
    await messagePage.verifyAndDeleteSentMessage();
  });

  test("TC 25501 25500: Desktop as Brigade Member - Unarchive a message", async () => {
    await navigationPage.goToMessageScreen();
    await messagePage.createAndSendNewmessage("Brigade Admins", "No");
    await messagePage.archiveAndUnarchiveMessage();
  });

  test("TC 25499: Create new message with response required and send response to yes and change response to no", async () => {
    await navigationPage.goToMessageScreen();
    await messagePage.createAndSendNewmessage("Brigade Admins", "Yes");
    await messagePage.changeResponseRequired();
  });

  test("TC 25371: Home - Desktop - Messages Inbox - all messages displayed for all brigades you are a member of ", async () => {
    const messagesHomeScreen = await homePage.getAllMessages({
      isDescending: true,
    });
    await navigationPage.goToMessageScreen();
    const messageInboxList = await messagePage.getAllMessages();
    expect(
      messageInboxList,
      "Message list in Inbox isnt same as on home screen"
    ).toEqual(messagesHomeScreen);
  });

  test("TC 48854: Brigade user should be able to send message to all brigade admins by selecting locked group as brigade Admin. ", async () => {
    await navigationPage.goToMessageScreen();
    const messageInfo = await messagePage.createAndSendNewmessage(
      "Brigade Admins",
      "No"
    );
    await messagePage.verifyMessageInTab({
      tabs: ["Inbox", "Sent"],
      messageInfo,
    });
  });
});
