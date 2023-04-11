const { test, expect } = require("@playwright/test");
var customParseFormat = require("dayjs/plugin/customParseFormat");
const dayjs = require("dayjs");
class StationDisplayPage {
  constructor(page) {
    this.page = page;
    this.recentIncidentList = page.locator(".recent ul li");
    this.recentIncidentContainer = page.locator(".recent ul");
    this.pinInput = page.locator('[placeholder="Pin"]');
    this.secretInput = page.locator('[placeholder="Secret"]');
    this.registerButton = page.locator('button:has-text("Register")');
    this.incidentInProgress = page.locator(
      "//h4[contains(text(),'Incident In Progress')]"
    );
    this.incidentBell = page.locator(".incidentBell");
    this.incidentDetailsTitle = page.locator("text=Incident Details");
    this.applianceTab = page.locator('a:has-text("Appliances")');
    this.changeApplicationStatusModalYes = page.locator("text=Yes");
  }

  async getRecentIncidentsListTotalCount() {
    await this.page.waitForLoadState("networkidle");
    return await this.recentIncidentList.count();
  }

  async activateDevice(devicePin, deviceSecret) {
    await this.page.locator("h2", { hasText: "Device Activation" }).waitFor();
    await this.pinInput.fill(devicePin);
    await this.secretInput.fill(deviceSecret);
    await Promise.all([
      this.page.waitForNavigation(),
      this.registerButton.click(),
    ]);
  }

  async scrollRecentIncidents() {
    const box = await this.recentIncidentContainer.boundingBox();
    await this.page.mouse.move(box.x, box.y);
    await this.page.waitForTimeout(1000);
    await this.page.mouse.click(box.x, box.y);
    await this.page.waitForTimeout(1000);
    await this.page.mouse.wheel(0, 1000);
    await this.page.waitForTimeout(1000);
  }

  async isIncidentInProgress() {
    try {
      await this.page.waitForLoadState("networkidle");
      return await this.incidentInProgress.isVisible();
    } catch (err) {
      return false;
    }
  }

  async isRecentListInDecendingOrder() {
    let dateAndTime = [];
    dayjs.extend(customParseFormat);
    await this.page.waitForSelector(".recent ul li", { timeout: 5000 });
    const incidents = await this.page.locator(".recent ul li div div");
    const count = await incidents.count();
    for (let i = 0; i < count; ++i) {
      const text = await incidents.nth(i).textContent();
      const formattedDate = dayjs(text, "DD/MM/YYYY hh:mm A");
      dateAndTime.push(formattedDate.format());
    }

    const sortedDateAndTime = [...dateAndTime];
    sortedDateAndTime.sort();
    sortedDateAndTime.reverse();
    return JSON.stringify(dateAndTime) === JSON.stringify(sortedDateAndTime);
  }
  async getResponseCardLocatorFor(name) {
    return await this.page.locator(
      '//*[contains(text(),"' +
        name +
        '")]//ancestor::div[@class="response card"]'
    );
  }
  async changeIncidentToResponding(info) {
    const incident = info.incident;
    this.incidentBell.first().click(),
      await expect(await this.incidentDetailsTitle).toBeVisible({
        timeout: 5000,
      });
    const parentResponseCard = await this.getResponseCardLocatorFor(
      info.brigadeResponding
    );
    await parentResponseCard.locator("#responding").click();
    await parentResponseCard.locator("#arrived").click();
    try {
      await parentResponseCard
        .locator('//li/button[@class="button"]')
        .click({ timeout: 1000 }); // hidden
    } catch (e) {
      // in case of drop down - small screen
      await parentResponseCard.locator('div[role="listbox"]').click();
      await parentResponseCard
        .locator(
          '//div[@role="option" and text()="' + incident.callsignCode + '"]'
        )
        .click();
    }
    await this.applianceTab.click();
    await this.page
      .locator("text=" + incident.callsignCode + "K7 - On Station K1 >> button")
      .click();
    await this.changeApplicationStatusModalYes.click();
  }
  async changeIncidentToArrived({ incident, kcodeIdentifier }) {
    await this.page.reload();
    await this.page.waitForLoadState("networkidle");
    await this.applianceTab.click();
    await this.page
      .locator(
        "text=" +
          incident.callsignCode +
          kcodeIdentifier +
          " - Arrived >> button"
      )
      .click();

    await this.changeApplicationStatusModalYes.click();
  }
}

module.exports = { StationDisplayPage };
