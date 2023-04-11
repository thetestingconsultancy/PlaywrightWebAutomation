class NavigationPage {
  constructor(page) {
    this.page = page;
    this.homeButton = page.locator(".sidebar.button >> text=Home");
    this.availabilityButton = page.locator("text=Availability");
    this.messageButton = page.locator("[href$=messages]");
    this.groupsButton = page.locator("text=Groups");
    this.contactsButton = page.locator(".sidebar.button >> text=Contacts");
    this.thresholdButton = page.locator("[href$=thresholds]");
    this.reportingButton = page.locator("text=Reporting");
    this.comcenDashboardButton = page.locator("text=ComCen Dashboard");
    this.settingButton = page.locator("text=Settings");
    this.profileButton = page.locator("text=Profile");
    this.selfIncidentButton = page.locator(".sidebar.button >> text='Incident'");
  }

  async goToHomeScreen() {
    await Promise.all([
      this.page.waitForNavigation(),
      await this.homeButton.click(),
    ]);
  }

  async goToAvailabilityScreen() {
    await Promise.all([
      this.page.waitForNavigation(),
      await this.availabilityButton.click(),
    ]);
  }

  async goToMessageScreen() {
    await Promise.all([
      this.page.waitForNavigation(),
      await this.messageButton.click(),
    ]);
  }

  async goToGroupsScreen() {
    await Promise.all([
      this.page.waitForNavigation(),
      await this.groupsButton.click(),
    ]);
  }

  async goToContactScreen() {
    await Promise.all([
      this.page.waitForNavigation(),
      await this.contactsButton.click(),
    ]);
  }

  async goToThresholdScreen() {
    if (this.page.url().includes("/thresholds")) return;
    await Promise.all([
      this.page.waitForNavigation(),
      await this.thresholdButton.click(),
    ]);
  }

  async goToReportingScreen() {
    await Promise.all([
      this.page.waitForNavigation(),
      await this.reportingButton.click(),
    ]);
  }

  async goToComCenDashboardScreen() {
      return await Promise.all([
        this.page.waitForEvent("popup"),
        await this.page.locator('a:has-text("ComCen Dashboard")').click(),
      ]);
  }

  async goToSettingScreen() {
    await Promise.all([
      this.page.waitForNavigation(),
      await this.settingButton.click(),
    ]);
  }

  async goToProfileScreen() {
    await Promise.all([
      this.page.waitForNavigation(),
      await this.profileButton.click(),
    ]);
  }

  async goToSelfIncident() {
    await Promise.all([
      this.page.waitForNavigation(),
      await this.selfIncidentButton.click(),
    ]);
  }
}

module.exports = { NavigationPage };
