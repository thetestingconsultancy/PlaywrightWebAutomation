const { test, expect } = require("@playwright/test");
const { ERRORS, EXECUTIVE_MESSAGE_STATUSES } = require("../config/constant");
const { Utilitypage } = require("../utils/UtilityPage");
const users = require("../config/config.users.json");
var customParseFormat = require("dayjs/plugin/customParseFormat");
const dayjs = require("dayjs");
class ComCenDashboard {
  constructor(page) {
    this.page = page;
    this.dashboardHeaderTitle = page.locator(".dashboardheadertitle");

    this.bcpMenuOption = page.locator('a:has-text("BCP")');
    this.responseDashboardOption = page.locator(
      'a:has-text("Response Dashboard")'
    );
    this.availabilityDashboardOption = page.locator(
      'a:has-text("Availability Dashboard")'
    );
    this.executiveMessagesOption = page.locator(
      'a:has-text("Executive Messages")'
    );
    this.turnoutMessageTab = page.locator('a > span:text-is("TurnoutMessage")');
    this.coverMoveTurnoutMessageTab = page.locator(
      'a:has-text("CoverMoveTurnoutMessage")'
    );
    this.applianceTab = page.locator('a:has-text("Appliance")');
    this.commsCentreMessagingTab = page.locator(
      'a:has-text("CommsCentreMessaging")'
    );
    this.cadNumberInput = page.locator('input[name="Cad Number Digits"]');
    this.callSourceCodeInput = page.locator(
      '#callSourceCode input[type="text"]'
    );
    this.eventTypeInput = page.locator('#eventType input[type="text"]');
    this.callSignInput = page.locator('#callsign input[type="text"]');
    this.callSignInputCloseIcon = page.locator("#callsign i >> nth=1");
    this.kcodeDropdown = page.locator('#kCode input[type="text"]');
    this.kcodeDropdownCloseIcon = page.locator("#kCode i >> nth=1");
    this.stationInput = page.locator('#station input[type="text"]');
    this.stationInputCloseIcon = page.locator("#station i >> nth=1");

    this.commonEventIdentifier = page.locator("input[name=CommonEventId]");

    this.addressSearch = page.locator('input[name="AddressSearch"]');
    this.emergencyServiceZoneIdentifierInput = page.locator(
      'input[name="EmergencyServicesZoneIdentifier"]'
    );
    this.incidentNoteTextInput = page.locator(
      '[placeholder="Incident Note Text"]'
    );
    this.postButton = page.locator('button:has-text("Post")');
    this.successMessage = page.locator(".positive");
    this.allFiltersCheckbox = page.locator(".filtercheckboxes > input");
    this.brigadeList = page.locator("//ul[@class='box']/li");
    this.incidentList = page.locator(".incident.row");
    this.executiveMessagesList = page.locator(
      ".executive.message.list >> .scrollcontainer >> ul > li "
    );
    this.scrollContainer = page.locator(".scrollcontainer");
    this.executiveMessagesListSentDateTime = page
      .locator(".executive.message.list >> .scrollcontainer >> .box > li >> ul")
      .locator("//li[3]");
    this.executiveMessagesListStatusList = page
      .locator(".executive.message.list >> .scrollcontainer >> .box > li >> ul")
      .locator("//li[4]");
    this.availableFilter = page.locator("#availablefilter");
    this.unAvailableFilter = page.locator("#unavailablefilter");
    this.messageBodyTextarea = page.locator(".message-body > textarea");

    // commsCentreMessaging
    this.brigadeInput = page.locator('div[role="listbox"] input[type="text"]');
    this.selectedBrigade = page.locator("div[role='alert']");
    this.messageTextInput = page.locator("input[name='Message Text']");
    this.errors = page.locator(".errors.red");

    //executive messagepage
    this.executiveMessageDetailsHeader = page.locator(
      'text="EXECUTIVE MESSAGE DETAILS"'
    );
    this.executiveMessageCallsignHeader = page.locator('text="CALLSIGN"');
    this.executiveMessageSentDateTimeHeader = page.locator(
      'text="SENT DATETIME"'
    );
    this.executiveMessageResponseHeader = page.locator('text="RESPONSE"');
    this.executiveMessageResponseTimeHeader = page.locator(
      'text="RESPONSE TIME"'
    );
  }

  async getHeaderTitle() {
    return await this.dashboardHeaderTitle.textContent();
  }

  async navigateToResponseDashboardOption() {
    await this.responseDashboardOption.click();
  }

  async validateDateTimeList() {
    let dateAndTime = [];
    dayjs.extend(customParseFormat);
    const dateTimeList = await this.executiveMessagesListSentDateTime;
    const count = await this.executiveMessagesListSentDateTime.count();
    for (let i = 0; i < count; ++i) {
      const text = await dateTimeList.nth(i).textContent();
      const formattedDate = dayjs(text, "DD/MM/YYYY hh:mm A");
      dateAndTime.push(formattedDate.format());
    }
    const sortedDateAndTime = [...dateAndTime];
    sortedDateAndTime.sort();
    sortedDateAndTime.reverse();
    expect(
      JSON.stringify(dateAndTime) === JSON.stringify(sortedDateAndTime),
      "Date TimeList is not in decsending order"
    ).toBeTruthy();
  }

  async scrollExecutiveMessages() {
    const box = await this.scrollContainer.boundingBox();
    await this.page.mouse.move(box.x, box.y);
    await this.page.waitForTimeout(1000);
    await this.page.mouse.click(box.x, box.y);
    await this.page.waitForTimeout(1000);
    await this.page.mouse.wheel(0, 1500);
    await this.page.waitForTimeout(1000);
  }

  async validateExecutiveMessageHeader() {
    await expect(
      await this.executiveMessageDetailsHeader,
      "Wrong message details header"
    ).toBeVisible();
    await expect(
      await this.executiveMessageCallsignHeader,
      "Wrong message call sign header"
    ).toBeVisible();
    await expect(
      await this.executiveMessageSentDateTimeHeader,
      "Wrong sent datetime header"
    ).toBeVisible();
    await expect(
      await this.executiveMessageResponseHeader,
      "Wrong response header"
    ).toBeVisible();
    await expect(
      await this.executiveMessageResponseTimeHeader,
      "Wrong response time header"
    ).toBeVisible();
  }

  async validateExecutiveMessageStatus() {
    await this.executiveMessagesListStatusList
      .first()
      .waitFor({ timeout: 2000 });
    const total = await this.executiveMessagesListStatusList.count();
    console.log(total);
    for (let i = 0; i < total; i++) {
      const status = await this.executiveMessagesListStatusList
        .nth(i)
        .textContent();
      test.fail(
        !EXECUTIVE_MESSAGE_STATUSES.includes(status),
        "Invalid status passed: " + status
      );
    }
  }

  async navigateToBCPOption() {
    // await this.bcpMenuOption.click({ timeout: 10000 });
    await this.page.goto("/dashboard/bcp");
  }

  async navigateToAvailabilityDashboard() {
    await this.availabilityDashboardOption.click();
    await this.page.waitForLoadState("networkidle");
  }

  async navigateToExecutiveMessages() {
    await this.executiveMessagesOption.click();
  }

  async getCommsCentreMessagingTab() {
    return await this.commsCentreMessagingTab;
  }

  async getApplianceTab() {
    return await this.applianceTab;
  }

  async getCoverMoveTurnoutMessageTab() {
    return await this.coverMoveTurnoutMessageTab;
  }

  async getTurnoutMessageTab() {
    return await this.turnoutMessageTab;
  }

  async fillAndSelectBrigadeInput(brigadeName) {
    await this.brigadeInput.click();
    await this.brigadeInput.type(brigadeName);
    await this.page
      .locator("div[role='option']:has-text('" + brigadeName + "')")
      .click({ timeout: 2000 });
    await expect(
      await this.selectedBrigade,
      "Select brigade is not " + brigadeName
    ).toContainText(brigadeName);
  }

  async fillMessageTextAndValidateMaxLength(maxLength) {
    const utilityPage = new Utilitypage();
    const randomText =
      "CommsCentreMessage Random Message Text" +
      utilityPage.GetRandomAlphaString(maxLength);
    await this.messageTextInput.type(randomText);
    const messageBodyText = JSON.parse(
      await this.messageBodyTextarea.textContent()
    );
    expect(
      messageBodyText.messageText,
      "Message body text is not same as entered"
    ).toEqual(randomText.substring(0, maxLength));
  }

  async assertEmptyFormSubmission_commsCentreMessaging() {
    await this.postButton.click();

    // await this.errorTexts
    const errorTexts = [];
    const errorLocators = await this.errors;
    for (let i = 0; i < (await errorLocators.count()); i++) {
      errorTexts.push(await errorLocators.nth(i).textContent());
    }

    expect
      .soft(errorTexts[0], "Invalid error text for empty brigade field")
      .toEqual(ERRORS.EMPTY_BRIGADE_FIELD);
    expect
      .soft(errorTexts[1], "Invalid error text for empty text field")
      .toEqual(ERRORS.EMPTY_MESSAGE_TEXT);
    expect(test.info().errors).toHaveLength(0);
  }
  async clickCommsCentreMessagingTab() {
    await this.commsCentreMessagingTab.click();
  }
  async assertInvalidBrigadeFormSubmission_commsCentreMessaging() {
    const utilityPage = new Utilitypage();
    const brigadeName = "Brigade" + utilityPage.GetRandomAlphaString(10);
    await this.brigadeInput.click();
    await this.brigadeInput.type(brigadeName);
    await this.messageTextInput.type("Random message");
    await this.postButton.click();
    expect(
      await this.errors.first().textContent(),
      "Invalid error text for empty brigade field"
    ).toEqual(ERRORS.EMPTY_BRIGADE_FIELD);
  }

  async fillAndPostCommsCentreMessagingForm(params) {
    const env = process.env.NODE_ENV;
    const user = env === "uat" ? users.uat : users.stage;
    const brigadeMember = params?.brigade || user.admin.brigadeName;
    const message =
      params?.messageText || "Message Text " + Math.floor(Math.random() * 1000);
    await this.fillAndSelectBrigadeInput(brigadeMember);
    await this.messageTextInput.type(message);
    await this.postButton.click();
    await expect(
      await this.page.locator("text=POST/CommsCentreMessaging successful for ")
    ).toBeVisible({ timeout: 20000 });

    return { brigadeMember, message };
  }

  async createIncident(incident) {
    const incObj = {
      cadNumber:
        incident?.cadNumber ||
        "F" + Math.floor(1000000 + Math.random() * 9000000),
      callSourceCode: "123",
      eventType: incident?.eventType || "Aircraft",
      callsignCode: incident?.callsignCode || "AUTO001",
      addressTitle: "80 The Terrace",
      emergencyServiceZoneIdentifier: Math.floor(
        1000 + Math.random() * 9000
      ).toString(),
      incidentNoteText:
        "RANDOM INCIDENT NOTE" + Math.floor(Math.random() * 1000),
    };

    await this.page.waitForTimeout(2000);
    // await this.page.waitForLoadState("networkidle");
    await this.bcpMenuOption.click({ timeout: 10000 });
    await this.turnoutMessageTab.click();
    await this.cadNumberInput.click();
    await this.cadNumberInput.fill(incObj.cadNumber);

    await this.callSourceCodeInput.click();
    await this.page.keyboard.type(incObj.callSourceCode);
    await this.page
      .locator(
        '//*[@id="callSourceCode"]/div/div[text()="' +
          incObj.callSourceCode +
          '"]'
      )
      .click({ timeout: 4000 });

    await this.eventTypeInput.click();
    await this.eventTypeInput.fill(incObj.eventType);
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press("ArrowDown");
    await this.page.keyboard.press("Enter");

    await this.callSignInput.click();
    await this.callSignInput.fill(incObj.callsignCode);
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press("ArrowDown");
    await this.page.keyboard.press("Enter");

    await this.callSignInputCloseIcon.first().click();
    await this.addressSearch.click();
    await this.addressSearch.fill(incObj.addressTitle);
    await this.page
      .locator("text=" + incObj.addressTitle)
      .first()
      .click();
    await this.emergencyServiceZoneIdentifierInput.click();
    await this.emergencyServiceZoneIdentifierInput.fill(
      incObj.emergencyServiceZoneIdentifier
    );
    await this.incidentNoteTextInput.click();
    await this.incidentNoteTextInput.fill(incObj.incidentNoteText);
    await this.page.waitForTimeout(500);
    const messageBodyText = await this.messageBodyTextarea.textContent();
    if (!messageBodyText.includes("callSourceCode")) {
      console.log("callSourceCode was not there, so adding again ");
      await this.callSourceCodeInput.click();
      await this.page.keyboard.type(incObj.callSourceCode);
      await this.page.waitForTimeout(500);
      await this.page.keyboard.press("ArrowDown");
      await this.page.waitForTimeout(500);
      await this.page.keyboard.press("Enter");
    }
    // await Promise.all([this.successMessage.waitFor({ timeout: 10000 }), await this.postButton.click()]);
    await this.postButton.click();
    // await expect(await this.successMessage).toBeVisible({ timeout: 10000 });
    await expect(
      await this.page.locator(
        "text=POST/TurnoutMessage successful for " + incObj.callsignCode
      )
    ).toBeVisible({ timeout: 50000 });
    return incObj;
  }
  async createCoverMoveIncident(incident) {
    const incObj = {
      callsignCode: incident?.callsignCode || "AUTO001",
      station: incident?.station || "WELLINGTON CITY",
      commonEventIdentifier: incident?.commonEventIdentifier || "1213",
    };
    await this.page.waitForTimeout(5000);
    await this.bcpMenuOption.waitFor({ timeout: 10000 });
    // await this.page.waitForLoadState("networkidle");
    // await this.page.pause();
    await this.bcpMenuOption.click();
    await this.coverMoveTurnoutMessageTab.click();

    await this.callSignInput.click();
    await this.callSignInput.fill(incObj.callsignCode);
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press("ArrowDown");
    await this.page.keyboard.press("Enter");

    await this.stationInput.click();
    await this.stationInput.fill(incObj.station);
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press("ArrowDown");
    await this.page.keyboard.press("Enter");

    await this.commonEventIdentifier.fill(incObj.commonEventIdentifier);

    await Promise.all([
      this.successMessage.waitFor({ timeout: 30000 }),
      this.postButton.click(),
    ]);
    await expect(await this.successMessage).toBeVisible();
    await expect(
      await this.page.locator(
        "text=POST/CoverMoveTurnoutMessage successful for " +
          incObj.callsignCode
      )
    ).toBeVisible();
    return incObj;
  }

  async changeKcode({ callsignCode, kcodeIdentifier }) {
    await this.bcpMenuOption.click();
    await this.applianceTab.click();

    await this.callSignInput.click();
    await this.callSignInput.fill(callsignCode);
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press("ArrowDown");
    await this.page.keyboard.press("Enter");

    await this.kcodeDropdown.click();
    await this.kcodeDropdown.fill(kcodeIdentifier);
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press("ArrowDown");
    await this.page.keyboard.press("Enter");

    await Promise.all([
      this.successMessage.waitFor({ timeout: 30000 }),
      this.postButton.click(),
    ]);
    await expect(
      await this.page.locator(
        "text=POST/Appliance/KCodeMessage successful for " + callsignCode
      )
    ).toBeVisible({ timeout: 5000 });
  }

  async searchandValidateIncidentResponse({
    search,
    incidents = [],
    incident,
    officer = 0,
    crew = 0,
    driver = 0,
  }) {
    const searchContent = await this.page
      .locator(".selection.search.dropdown > div")
      .first()
      .textContent();
    if (searchContent === "Search") {
      await this.page
        .locator(".selection.search.dropdown > input")
        .fill(search);
      await this.page
        .locator('div[role="option"]:has-text("' + search + '")')
        .click();
    }
    if (incident && incidents.length < 1) {
      incidents.push(incident);
    }
    console.log("total items in incidents", incidents.length);
    incidents.reverse(); // revsersing the order as first incident created will belast in serch results - validating order

    const resultIncidentRows = await this.page.locator(
      ".incident.list >> .incident.row > ul"
    );
    // await resultIncidentRows.first().waitFor({ timeout: 10000 });
    await this.page.waitForTimeout(2000);
    const totalResultItems = await resultIncidentRows.count();
    console.log("total incident rows", totalResultItems);
    for (let i = 0; i < totalResultItems; i++) {
      const row = await resultIncidentRows.nth(i);
      // await this.page.pause();
      const logoLocator = await row.locator(".logo");
      await logoLocator.waitFor({ timeout: 5000 });
      await expect(await logoLocator, "Logo is not visible").toBeVisible();
      const {
        cadNumber,
        eventType,
        callsignCode,
        emergencyServiceZoneIdentifier,
        incidentNoteText,
      } = incidents[i];
      let eventTypeCode;
      if (eventType === "Aircraft") eventTypeCode = "AIRH";
      await expect(
        await row.locator(".details > p").first(),
        "cad number and eventype text mismatch"
      ).toHaveText(cadNumber + " - " + eventTypeCode);
      await expect(
        await row.locator(".details > p").nth(1),
        "incident note text and emergency service identifier mismatch"
      ).toContainText(
        incidentNoteText + " - " + emergencyServiceZoneIdentifier
      );
      await expect(
        await row
          .locator(".appliance > ul > li", "Call sign code mismatch")
          .first()
      ).toContainText(callsignCode);
      if (officer > 0) {
        console.log(
          "\nchecking officer value",
          officer,
          "\nActual Value:",
          await row.locator(".appliance > ul > li").nth(4).textContent()
        );
        await expect(
          await row.locator(".appliance > ul > li").nth(4),
          "officer count mismatch"
        ).toContainText(String(officer));
      }
      if (crew > 0) {
        await expect(
          await row.locator(".appliance > ul > li").nth(3),
          "Crew count mismatch"
        ).toContainText(String(crew));
      }
      if (driver > 0) {
        await expect(
          await row.locator(".appliance > ul > li").nth(2),
          "driver count mismatch"
        ).toContainText(String(driver));
      }
    }
  }

  async clearSearch() {
    const searchContent = await this.page
      .locator(".selection.search.dropdown > div")
      .first()
      .textContent();
    if (searchContent !== "Search") {
      const searchClearIcon = await this.page.locator(".icon.float.close");
      await searchClearIcon.click();
    }
  }

  async checkFiltersEnabled(status) {
    const totalCheckboxes = await this.allFiltersCheckbox.count();
    for (let i = 0; i < totalCheckboxes; i++) {
      if (status) {
        await expect(await this.allFiltersCheckbox.nth(i)).toBeEnabled();
      } else {
        await expect(await this.allFiltersCheckbox.nth(i)).toBeDisabled();
      }
    }
  }
  async search(text) {
    await this.clearSearch();
    await this.page.locator(".selection.search.dropdown > input").fill(text);
    await this.page
      .locator('div[role="option"]:has-text("' + text + '")')
      .click();
  }

  async validateSearchAutoComplete({ autoComplete, search }) {
    await this.clearSearch();
    await this.page.locator(".selection.search.dropdown > input").fill(search);
    await this.page
      .locator('div[role="option"]:has-text("' + autoComplete + '")')
      .click();
    await expect(
      await this.page.locator(".selection.search.dropdown > div").first()
    ).toHaveText(autoComplete);
  }
  _getBrigadeList = async () => {
    await this.page.waitForLoadState("networkidle");
    const totalBrigades = await this.brigadeList.count();
    let nameArray = [];
    for (let i = 0; i < totalBrigades; i++) {
      const text = await this.brigadeList.nth(i).locator(".name").textContent();
      nameArray.push(text.trim());
    }
    return nameArray;
  };
  async validBrigadeInAlphabeticalOrder() {
    const nameArray = await this._getBrigadeList();
    const actual = [...nameArray];
    const expected = [...nameArray];
    expected.sort();
    expect(actual).toEqual(expected);
  }

  async unselectFilters(filters) {
    await this.page.waitForTimeout(500);
    if (!this.page.url().includes("/executive-messages")) {
      await this.clearSearch();
    }

    for (let filter of filters) {
      const element = await this.page.locator(
        "//label[text()='" + filter + " ']/preceding-sibling::input"
      );
      await element.uncheck();
    }
    await this.page.waitForTimeout(2000);
  }

  async selectFilters(filters) {
    const filtersToSelect = filters || "All";
    await this.page.waitForTimeout(500);
    if (!this.page.url().includes("/executive-messages")) {
      await this.clearSearch();
    }

    if (filtersToSelect === "All") {
      const totalCheckboxes = await this.allFiltersCheckbox.count();
      for (let i = 0; i < totalCheckboxes; i++) {
        await this.allFiltersCheckbox.nth(i).check();
      }
    } else {
      for (let filter of filters) {
        const element = await this.page.locator(
          "//label[text()='" + filter + " ']/preceding-sibling::input"
        );
        await element.check();
      }
    }
    await this.page.waitForTimeout(2000);
  }

  async checkIfBrigadeListIncludes(list) {
    const brigadeList = await this._getBrigadeList();
    let isSubArr = await list.every((e) => brigadeList.includes(e));
    return isSubArr;
  }

  async getDriverCrewOfficerCount(member) {
    const memberBox = await this.page.locator(".box >> ul", {
      hasText: member,
    });
    const driver = Number(await memberBox.locator("li").nth(1).textContent());
    const crew = Number(await memberBox.locator("li").nth(2).textContent());
    const officer = Number(await memberBox.locator("li").nth(3).textContent());
    return { driver, crew, officer };
  }
  async getBrigadeMemberAvailabilityStatus(member) {
    const memberBox = await this.page.locator(".box >> ul", {
      hasText: member,
    });
    const statusWrapper = await memberBox.locator("li").nth(4);
    const status = await statusWrapper
      .locator(".availability.tick")
      .getAttribute("class");
    if (await status.includes("not met")) {
      return false;
    }
    return true;
  }

  getBrigadesCount = async () => {
    let available = 0;
    let unavailable = 0;

    const statusLocator = await this.brigadeList.locator(".availability.tick");
    const availabilityStatusLocator = await this.brigadeList.locator(
      "//div[@class='availability tick met']"
    );
    const unAvailabilityStatusLocator = await this.brigadeList.locator(
      "//div[@class='availability tick not met']"
    );
    const total = await statusLocator.count();
    available = await availabilityStatusLocator.count();
    unavailable = await unAvailabilityStatusLocator.count();

    return { available, unavailable, total };
  };
  getIncidentsCount = async () => {
    let available = 0;
    let unavailable = 0;

    const statusLocator = await this.incidentList.locator(".availability.tick");
    const availabilityStatusLocator = await this.incidentList.locator(
      "//div[@class='availability tick met']"
    );
    const unAvailabilityStatusLocator = await this.incidentList.locator(
      "//div[@class='availability tick not met']"
    );
    const total = await statusLocator.count();
    available = await availabilityStatusLocator.count();
    unavailable = await unAvailabilityStatusLocator.count();
    return { available, unavailable, total };
  };

  getExecutiveMessagesCount = async () => {
    return await this.executiveMessagesList.count();
  };
  changeAvailableFilterStatus = async ({
    available = true, // default value in case value is not passed
    unavailable = true, // default value in case value is not passed
  }) => {
    if (available) {
      await this.availableFilter.check();
    } else {
      await this.availableFilter.uncheck();
    }

    if (unavailable) {
      await this.unAvailableFilter.check();
    } else {
      await this.unAvailableFilter.uncheck();
    }
    await this.page.waitForTimeout(2000);
  };
}

module.exports = { ComCenDashboard };
