const { test, expect } = require("@playwright/test");

class SelfIncidentPage {
  constructor(page) {
    this.page = page;

    this.callSignDropdown = page.locator("#callsign");
    this.turnOutDropdown = page.locator("#turnout-type");
    this.incidentInfoInput = page.locator("#incidentInfoText");
    this.turnoutButton = page.locator("button", { hasText: "Turnout" });
    this.turnoutModalButton = page.locator(".modal >> button", {
      hasText: "Turnout",
    });
  }

  async fillAndSubmitSelfIncidentForm(info) {
    const incidentInforText =
      info?.incidentInfoText ||
      "Incident Info Text" + Math.floor(Math.random() * 1000);
    await this.incidentInfoInput.fill(incidentInforText);
    await this.turnoutButton.click();
    await Promise.all([
      this.page.waitForNavigation(),
      await this.turnoutModalButton.click(),
    ]);
  }
}

module.exports = { SelfIncidentPage };
