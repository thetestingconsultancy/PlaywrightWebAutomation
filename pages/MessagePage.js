const { test, expect } = require("@playwright/test");
const { Utilitypage } = require("../utils/UtilityPage");

var titleNum;
var messageTitle;
var messageBodyText;

class MessagePage {
  constructor(page) {
    this.page = page;
    this.messageHeading = page.locator("//h1[text()='Messages']");
    this.messageSearchInput = page.locator("#messagesearch");
    // Create new message locators
    this.createNewMessageButton = page.locator("text=New Message");
    this.toMessage = page.locator("#to");
    this.createNewMessageTitle = page.locator("#title");
    this.messageBody = page.locator("#message");
    this.responseRequiredCheckbox = page.locator(
      "label[for='ResponseRequired']"
    );
    this.sendButton = page.locator("text=Send");
    // Delete message locators
    this.deleteButton = page.locator("//button[text()='Delete']");
    this.deleteMessagePopup = page.locator("//h3[text()='Delete Message']");
    this.deleteMessageWarningPopup = page.locator(
      "//p[text()='Are you sure you want to delete this Message?']"
    );
    this.deleteButtonPopup = page.locator("//button[@class='delete button']");
    // Message Inbox, Archvied Tabs
    this.inboxTab = page.locator("//button[text()=' Inbox ']");
    this.sentTab = page.locator("//button[text()='Sent']");
    this.archivedTab = page.locator("//button[text()=' Archived ']");

    this.archiveButton = page.locator("//button[text()=' Archive ']");
    this.unArchiveButton = page.locator("//button[text()=' Unarchive ']");

    // Response
    this.yourResponseLable = page.locator(
      "//h5[text()='What is your response?']"
    );
    this.yesButton = page.locator("//button[text()=' Yes ']");
    this.noButton = page.locator("//button[text()=' No ']");
    this.changeResponse = page.locator("//div[text()='Change response']");
    this.responseStatusYes = page.locator("//h5[text()='Response: Yes']");
    this.responseStatusNo = page.locator(" //h5[text()='Response: No']");

    // Mesages inside sent tab
    this.numberOfYesResponses = page.locator("//div[contains(text(),'Yes (')]");
    this.numberOfNoResponses = page.locator("//div[contains(text(),'No (')]");
    this.messageCards = page.locator(".message.card");

    // Message Details
    this.messageDetails_text = page.locator("h2");
    this.messageDetails_recipiants = page.locator(".recipiants");
    this.messageDetails_brigade = page.locator(
      ".message.details >> .paragraph"
    );
  }

  selectGroupsFromDropdown(sendMessageTo) {
    return this.page.locator("//div[text()='" + sendMessageTo + "']");
  }

  messageTitle(title) {
    return this.page.locator("//div[contains(text(),'" + title + "')]");
  }

  async getMessageTitle() {
    const title = await this.messageHeading.textContent();
    console.log("Title is here ----> " + title);
    expect(title).toEqual("Messages", "Message title is not displayed");
  }

  async createAndSendNewmessage(sendMessageTo, responseRequired) {
    const utilityPage = new Utilitypage();
    await this.createNewMessageButton.click();
    await this.toMessage.click();
    await this.selectGroupsFromDropdown(sendMessageTo).click();
    titleNum = utilityPage.GetRandomPhoneNumberSuffix();
    messageTitle = "This is automation test " + titleNum;
    messageBodyText = "This is automation test message body";
    console.log("Writing message title is ----> " + messageTitle);
    await this.createNewMessageTitle.type(messageTitle, { delay: 50 });
    await this.messageBody.type(messageBodyText, {
      delay: 50,
    });

    if (responseRequired == "Yes") {
      await this.responseRequiredCheckbox.click();
      console.log("Response is required");
    } else {
      console.log("Response is not required");
    }
    await this.sendButton.click();
    await this.page.waitForTimeout(2000);
    return { messageTitle, messageBodyText, responseRequired, sendMessageTo };
  }

  async verifyAndDeleteSentMessage() {
    const sentMessageTtite = await this.messageTitle(titleNum).textContent();
    console.log("Sent message title is ----> " + sentMessageTtite);
    expect(messageTitle).toEqual(
      sentMessageTtite,
      "Message title is not similar"
    );
    await this.messageTitle(titleNum).click();
    await this.page.waitForTimeout(2000);
    await this.deleteButton.click();
    await expect(
      this.deleteMessagePopup,
      "Delete message popup window is not visible"
    ).toBeVisible();
    await expect(
      this.deleteMessageWarningPopup,
      "Delete message warning popup window is not visible"
    ).toBeVisible();
    await this.deleteButtonPopup.click();
    await this.page.waitForTimeout(3000);
    await expect(
      this.messageTitle(titleNum),
      "Message is not deleted"
    ).toBeHidden();
  }

  async archiveAndUnarchiveMessage() {
    const sentMessageTtite = await this.messageTitle(titleNum).textContent();
    console.log("Sent message title is ----> " + sentMessageTtite);
    expect(messageTitle).toEqual(
      sentMessageTtite,
      "Message title is not similar"
    );
    await this.messageTitle(titleNum).click();
    await this.page.waitForTimeout(2000);

    await this.archiveButton.click();
    await expect(
      this.messageTitle(titleNum),
      "Message is not archived"
    ).toBeHidden();

    await this.archivedTab.click();
    await expect(
      this.messageTitle(titleNum),
      "Message is not visible in archived tab"
    ).toBeVisible();

    await this.messageTitle(titleNum).click();
    await this.unArchiveButton.click();
    await expect(
      this.messageTitle(titleNum),
      "Message is not unarchived"
    ).toBeHidden();

    await this.inboxTab.click();
    await this.page.waitForTimeout(2000);
    await expect(
      this.messageTitle(titleNum),
      "Message is not visible in inbox tab"
    ).toBeVisible();
  }

  async changeResponseRequired() {
    const sentMessageTtite = await this.messageTitle(titleNum).textContent();
    expect(messageTitle).toEqual(
      sentMessageTtite,
      "Message title is not similar"
    );
    await this.messageTitle(titleNum).click();
    await this.page.waitForTimeout(2000);

    await expect(
      this.yourResponseLable,
      "Whats your response is not visible"
    ).toBeVisible();
    await expect(this.yesButton, "Yes button is not visible").toBeVisible();
    await expect(this.noButton, "No button is not visible").toBeVisible();

    await this.yesButton.click();
    await expect(
      this.responseStatusYes,
      "Response is not changed to yes"
    ).toBeVisible();

    await this.sentTab.click();
    await this.messageTitle(titleNum).click();

    await expect(
      this.numberOfYesResponses,
      "Fire fighters responding yes to message is not visible"
    ).toBeVisible();
    await expect(
      this.numberOfNoResponses,
      "Fire fighters responding no to message is not visible"
    ).toBeVisible();

    console.log(
      "Number of people responding to message ---> " +
        (await this.numberOfYesResponses.textContent())
    );
    await expect(this.numberOfYesResponses).toContainText("Yes");

    await this.numberOfYesResponses.click();
    const fightersRespondedYes = await this.page
      .locator("//div[@class='content active']")
      .textContent();
    console.log(
      "Fighters responded yes to message ---> " + fightersRespondedYes
    );

    // expect(await this.page.locator("//div[@class='content active']")).toContainText('jackson');

    expect(
      fightersRespondedYes.includes("AMSAuto Test"),
      "Fighter responded to message is not matching"
    ).toBeTruthy();
    await this.page.waitForTimeout(2000);

    // changing response to no
    await this.inboxTab.click();
    await this.messageTitle(titleNum).click();

    await this.changeResponse.click();
    await this.page.waitForTimeout(2000);

    await this.noButton.click();
    await expect(
      this.responseStatusNo,
      "Response is not changed to no"
    ).toBeVisible();

    await this.sentTab.click();
    await this.messageTitle(titleNum).click();

    await this.numberOfNoResponses.click();
    const fightersRespondedNo = await this.page
      .locator("//div[@class='content active']")
      .textContent();
    console.log("Fighters responded no to message ---> " + fightersRespondedNo);
    expect(
      fightersRespondedNo.includes("AMSAuto Test"),
      "Fighter responded to message is not matching"
    ).toBeTruthy();
  }

  async getAllMessages() {
    await this.page.locator(".messages.list.lists.small").waitFor();
    let messages = [];
    const totalMessages = await this.page.locator(".message.card").count();
    console.log("totalMessages", totalMessages);

    for (let i = 0; i < totalMessages; ++i) {
      const messageCard = await this.page.locator(".message.card").nth(i);
      messages.push(await messageCard.allTextContents());
    }
    return messages;
  }

  async getMessageCardWithTitle(title) {
    return await this.page.locator(".message.card", { hasText: title }).first();
  }

  async verifyMessageInTab({ tabs, messageInfo }) {
    let messageCard;
    for (let tab of tabs) {
      if (tab.toLowerCase() === "inbox") {
        await this.inboxTab.click();
      } else if (tab.toLowerCase() === "sent") {
        await this.sentTab.click();
      }
      await this.page.waitForTimeout(1000);
      messageCard = await this.getMessageCardWithTitle(
        messageInfo.messageTitle
      );
      if (tab.toLowerCase() === "sent") {
        expect(await messageCard.locator(".name")).toHaveText(
          messageInfo.sendMessageTo
        );
      }
      const messageBodyLocator = await messageCard.locator(".message");
      expect(await messageBodyLocator).toContainText(
        messageInfo.messageBodyText
      );
      const responseLocator = await messageCard.locator(".response").nth(1);
      if (messageInfo.responseRequired.toLowerCase === "no") {
        expect(await responseLocator.getAttribute("style")).toEqual(
          "display: none;"
        );
      } else {
        expect(await responseLocator.textContent()).toEqual(
          "Response Required"
        );
      }
    }
  }
  async validateLastMessage({ from, message, brigade }) {
    const messageCard = await this.messageCards.first();
    await messageCard.waitFor({ timeout: 5000 });

    await expect
      .soft(await messageCard.locator(".name").first(), "invalid sender name")
      .toHaveText(from);
    await expect
      .soft(await messageCard.locator(".title"), "invalid message text")
      .toHaveText(message);
    await expect
      .soft(await messageCard.locator(".message"), "invalid brigade name")
      .toContainText(brigade);

    await messageCard.click();
    await this.messageDetails_text.waitFor({ timeout: 3000 });
    await expect
      .soft(
        await this.messageDetails_text,
        "invalid message text on message details page"
      )
      .toHaveText(message);
    await expect
      .soft(
        await this.messageDetails_recipiants.locator("span").first(),
        "Invalid message details recipiants name"
      )
      .toHaveText(from);
    await expect
      .soft(
        await this.messageDetails_brigade,
        "Invalid message details brigade name"
      )
      .toContainText(brigade);
    expect(test.info().errors).toHaveLength(0);
  }

  //if search text is not passed then it will search for memberName
  async validateExistanceOfMessageFrom(memberName, serachText) {
    if (!serachText) {
      serachText = memberName;
    }
    await this.messageSearchInput.waitFor({ timeout: 5000 });
    await this.messageSearchInput.fill(""); //clearing existing search if any
    await this.messageSearchInput.type(serachText);
    const messageCard = await this.messageCards.first();
    await messageCard.waitFor({ timeout: 5000 });
    await expect
      .soft(await messageCard.locator(".name").first(), "invalid sender name")
      .toHaveText(memberName);
    await messageCard.click();
    await expect
      .soft(
        await this.messageDetails_recipiants.locator("span").first(),
        "Invalid message details recipiants name"
      )
      .toHaveText(memberName);
    expect(test.info().errors).toHaveLength(0);
  }
}

module.exports = { MessagePage };
