const { test, expect } = require("@playwright/test");

class ProfilePage {
  constructor(page) {
    this.page = page;

    //Recent Incident Frame
    this.customMessageInput = page.locator("#statustext");
    this.userInfo = page.locator(".user.info");
    this.headerCard = page.locator(".header.card");
    this.userName = page.locator(".user.name");
    this.notificationsTab = page.locator(".profile.tabs >> text=Notifications");
    this.incidentSettingsTab = page.locator(
      ".profile.tabs >> text=Incident Settings"
    );
    this.disableAllNotificationsCheckbox = page.locator(
      'input[name="DisableAll"]'
    );
    this.eta = page.locator(".eta.field > p");
    this.etaInput = page.locator("#eta");
    this.editButton = page.locator("//button[text()=' Edit ']");
    this.saveButton = page.locator("//button[text()='Save']");
  }

  async getCustomMessageInput() {
    return await this.customMessageInput;
  }

  async setCustomMessageInputValue() {
    const message = "Some random message " + Math.floor(Math.random() * 1000);
    await this.customMessageInput.fill(message);
    // await this.userInfo.click(); // to click outside
    const userName = await this.userName.textContent();
    return { message, userName };
  }

  async resetCustomMessageInputValue() {
    const message = "";
    await this.customMessageInput.fill(message);
    await this.userInfo.click(); // to click outside
  }

  async getCustomMessageInputValue() {
    const message = await this.page.evaluate(
      () => document.getElementById("statustext").value
    );
    console.log(message);
    return message;
  }

  async clickOnNotificationsTab() {
    await this.notificationsTab.waitFor();
    await this.notificationsTab.click();
  }

  async disableAllNotifications(disable) {
    await this.notificationsTab.waitFor();
    await this.notificationsTab.click();
    await this.disableAllNotificationsCheckbox.waitFor();
    if (disable) {
      await this.disableAllNotificationsCheckbox.check();
      await this.page.waitForTimeout(2000);
      console.log("Disabling...");
      expect(
        await this.getCustomMessageInputValue(),
        "Disable : Custom message is not correct"
      ).toEqual("All Notifications Disabled");
      await this.page.reload();
      await expect(
        await this.page.locator(
          ".header.card > .status.icon.notifications.disabled"
        ),
        "User Status icon not disabled or in grey"
      ).toBeVisible({ timeout: 5000 });
    } else {
      console.log("Enabling...");
      await this.page.waitForTimeout(500); // needed here otherwise it doesnt click on it
      await this.disableAllNotificationsCheckbox.uncheck();
      await this.page.waitForTimeout(2000);

      await this.page.reload();
      await expect(
        await this.page.locator(".header.card > .status.icon.available"),
        "User Status icon is not enabled or in green"
      ).toBeVisible({ timeout: 5000 });
      expect(
        await this.getCustomMessageInputValue(),
        "Enable : Custom message is not correct"
      ).not.toEqual("All Notifications Disabled");
    }
  }

  async getCurrentETA() {
    await this.incidentSettingsTab.click();
    return await this.eta.textContent();
  }

  async changeETATo(num) {
    await this.incidentSettingsTab.click();
    await this.editButton.click();
    await this.etaInput.fill(num);
    await this.saveButton.click();
  }
}

module.exports = { ProfilePage };
