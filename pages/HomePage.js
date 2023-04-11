const { test, expect } = require("@playwright/test");
const { Utilitypage } = require("../utils/UtilityPage");

var customParseFormat = require("dayjs/plugin/customParseFormat");
const dayjs = require("dayjs");

var titleNum;
var messageTitle;

class HomePage {
  constructor(page) {
    this.page = page;

    //Recent Incident Frame
    this.recentIncidentHeader = page.locator("h2", {
      hasText: "Recent Incidents",
    });
    this.recentIncidentList = page.locator(".recent ul li");
    this.recentIncidentContainer = page.locator(".recent ul");
    this.contactSearch = page.locator("#contactsearch");
    this.memberCard = page.locator(".member.card");
    this.messageCards = page.locator(".message.card");

    //Incident validations
    this.headerInRed = page.locator(".header.with.emergency");
    this.incidentBell = page.locator(".incidentBell");
    this.incidentDetailsTitle = page.locator("text=Incident Details");
    this.incidentDetails = page.locator("//*[@class='incident details']");
    this.callsignCodeDetails = page.locator(".callSignCodes");
    this.callSourceCodeDetails = page.locator(".code");
    this.incidentPlaceName = page.locator(".place.name");
    this.incidentDescription = page.locator(".description");
    this.incidentCloseIcon = page.locator(".icon.close.svg");
    this.incidentDeleteButton = page.locator(".delete.button");
    this.noIncidentTitle = page.locator(
      "//h4[contains(text(),'No Current Incidents')]"
    );
    // this.noIncidentTitle = page.locator("text= No Current Incidents ");
    this.incidentInProgress = page.locator(
      "//h4[contains(text(),'Incident In Progress')]"
    );

    // Threshold shortage
    this.noCurrentThresholdShortage = page.locator(
      "//h5[contains(text(),'No Current Threshold Shortages')]"
    );
    this.stopThresholdModalConfirm = page.locator("text=Confirm");
    this.stopThresholdButton = page.locator("text=Stop Thresholds");
    this.thresholdShortageText = page.locator(".threshold.controls >> p");

    // Appliance tab
    this.applianceTab = page.locator('a:has-text("Appliances")');
    this.changeApplicationStatusModalYes = page.locator("text=Yes");
    this.selectedBrigade = page.locator(".header.controls >> .text");

    // appliance responding
    this.respondingEta = page.locator(".eta");
  }

  async getNoIncidentTitle() {
    await this.page.waitForLoadState("networkidle");
    return await this.noIncidentTitle;
  }

  async clickIncidentBell() {
    // await this.incidentBell.click();
    const pageUrl = await this.page.url();
    if (!pageUrl.includes("incident") || pageUrl.includes("incidentsettings")) {
      await Promise.all([
        this.page.waitForNavigation({ timeout: 5000 }),
        await this.incidentBell.first().click({ timeout: 2000 }),
      ]);
    }
  }

  async stopThresholdAndConfirm() {
    await this.stopThresholdButton.click();
    await this.stopThresholdModalConfirm.click();
  }

  async getRecentIncidentsHeader() {
    await this.page.waitForLoadState("networkidle");
    return await this.recentIncidentHeader;
  }

  async getRecentIncidentsList() {
    await this.page.waitForLoadState("networkidle");
    return await this.recentIncidentList;
  }
  async getRecentIncidentsListTotalCount() {
    await this.page.waitForLoadState("networkidle");
    return await this.recentIncidentList.count();
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

  async noCurrentThresholdShortageVisiblity() {
    try {
      return await this.noCurrentThresholdShortage.isVisible();
    } catch (err) {
      return false;
    }
  }

  async validateMessageForContact(contact, message) {
    await this.contactSearch.type(contact, { delay: 30 });
    await this.page.waitForTimeout(3000);
    await expect(await this.memberCard).toContainText(message);
  }

  async validateLastMessage({ from, message, brigade }) {
    const messageCard = await this.messageCards.first();
    await messageCard.waitFor({ timeout: 5000 });

    expect
      .soft(await messageCard.locator(".name").first(), "invalid sender name")
      .toHaveText(from);
    expect
      .soft(await messageCard.locator(".title"), "invalid message text")
      .toHaveText(message);
    expect
      .soft(await messageCard.locator(".message"), "invalid brigade name")
      .toContainText(brigade);
    expect(test.info().errors).toHaveLength(0);
  }

  async isIncidentInProgress() {
    try {
      await this.page.waitForLoadState("networkidle");
      return await this.incidentInProgress.isVisible();
    } catch (err) {
      return false;
    }
  }
  _expectNoIncideInProgress = async () => {
    try {
      await expect(await this.noIncidentTitle).toBeVisible({ timeout: 10000 });
    } catch (e) {
      await this.page.reload();
      await expect(await this.noIncidentTitle).toBeVisible({ timeout: 30000 });
    }
  };
  async closeAllIncidentsInProgress() {
    if (await this.isIncidentInProgress()) {
      await this.clickIncidentBell();
      await expect(await this.incidentDetailsTitle).toBeVisible({
        timeout: 20000,
      });
      let totalIncidents = await this.incidentCloseIcon.count();
      do {
        await this.incidentCloseIcon.first().click();
        try {
          await this.page.waitForTimeout(1000);
          await this.incidentDeleteButton.click();
          await this.page.waitForTimeout(10000);
          // await this.page.reload();
          // await this.page.waitForTimeout(5000);
          // await this.page.waitForLoadState("networkidle");
          totalIncidents = await this.incidentCloseIcon.count();
        } catch (e) {
          break;
        }
      } while (totalIncidents > 0);
      await this._expectNoIncideInProgress();
    }
  }
  async checkIncidentAndCloseInProgress(incident) {
    await this.checkIncidentInProgress(incident);
    await this.incidentCloseIcon.first().click();
    await this.incidentDeleteButton.click();
    await this._expectNoIncideInProgress();
  }
  async checkIncidentInProgress(incident) {
    await expect(await this.incidentInProgress).toBeVisible();
    await expect(await this.headerInRed).toBeVisible(); // to check for red color
    await this.clickIncidentBell();
    await expect(await this.incidentDetailsTitle).toBeVisible();
    await expect(await this.callsignCodeDetails.first()).toHaveText(
      incident.callsignCode
    );
    await expect(await this.callSourceCodeDetails.first()).toHaveText(
      incident.callSourceCode + " - AIRH"
    );
    const addressTitle = incident.addressTitle;
    await expect(await this.incidentPlaceName.first()).toContainText(
      addressTitle.toUpperCase()
    );
    await expect(await this.incidentDescription.first()).toHaveText(
      incident.incidentNoteText + " #" + incident.cadNumber
    );
  }
  // takes two incident at the moment, update if required for 3rd incident
  async validateAndRespondMultipleIncidents(incidents) {
    const { incident1, incident2 } = incidents;

    // Checking Incident in Progress
    await expect(await this.incidentInProgress).toBeVisible();
    await expect(await this.headerInRed).toBeVisible(); // to check for red color
    await this.clickIncidentBell();

    // Validating Incident Details
    await expect(await this.incidentDetailsTitle).toBeVisible();
    const actualCallSignCodesText = await this.callsignCodeDetails
      .first()
      .textContent();
    const callSignCodesList = actualCallSignCodesText.split(", ");
    console.log("Call Sign Codes List ", callSignCodesList);
    expect(
      callSignCodesList.includes(incident1.callsignCode),
      "Call sign code for first incident is missing"
    ).toBeTruthy();
    expect(
      callSignCodesList.includes(incident2.callsignCode),
      "Call sign code for second incident is missing"
    ).toBeTruthy();
    await expect(await this.callSourceCodeDetails.first()).toHaveText(
      incident2.callSourceCode + " - AIRH"
    );
    const addressTitle = incident2.addressTitle;
    await expect(await this.incidentPlaceName.first()).toContainText(
      addressTitle.toUpperCase()
    );
    await expect(await this.incidentDescription.first()).toHaveText(
      incident2.incidentNoteText + " #" + incident2.cadNumber
    );
    await this._respondToIncident(incident1);
    await this._respondToIncident(incident2);
    // await expect(await this.noIncidentTitle).toBeVisible();
    await this._expectNoIncideInProgress();
  }

  async _respondToIncident(incident) {
    console.log(incident);
    const parentResponseCard = await this.getResponseCardLocatorFor(
      incident.brigadeResponding
    );
    await parentResponseCard.locator("#responding").click();
    await parentResponseCard.locator("#arrived").click();
    // })
    console.log(incident.callsignCode);

    try {
      await parentResponseCard
        .locator(
          '//li/button[@class="button" and text()=" ' +
            incident.callsignCode +
            ' "]'
        )
        .click({ timeout: 3000 });
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
    await this.page
      .locator("text=" + incident.callsignCode + "K1 - Responding >> button")
      .click();

    await this.changeApplicationStatusModalYes.click();
  }
  async changeBrigadeStatusToResponding(member) {
    await this.clickIncidentBell();
    const parentResponseCard = await this.getResponseCardLocatorFor(member);
    await parentResponseCard.locator("#responding").click();
  }
  async getResponseCardLocatorFor(name) {
    return await this.page.locator(
      '//*[contains(text(),"' +
        name +
        '")]//ancestor::div[@class="response card"]'
    );
  }
  async respondIncidentAndCloseInProgress(info) {
    const incident = info.incident;
    await expect(await this.incidentInProgress).toBeVisible();
    await expect(await this.headerInRed).toBeVisible(); // to check for red color
    await Promise.all([
      this.page.waitForNavigation(),
      this.incidentBell.first().click(),
    ]);
    await expect(await this.incidentDetailsTitle).toBeVisible();
    await expect(await this.callsignCodeDetails.first()).toHaveText(
      incident.callsignCode
    );

    let callSoruceCodePostfix = "AIRH";
    if (incident.eventType.toLowerCase() === "vegetation") {
      callSoruceCodePostfix = "VEG";
    }
    await expect(await this.callSourceCodeDetails.first()).toHaveText(
      incident.callSourceCode + " - " + callSoruceCodePostfix
    );
    const addressTitle = incident.addressTitle;
    await expect(await this.incidentPlaceName.first()).toContainText(
      addressTitle.toUpperCase()
    );
    await expect(await this.incidentDescription.first()).toHaveText(
      incident.incidentNoteText + " #" + incident.cadNumber
    );
    const parentResponseCard = await this.getResponseCardLocatorFor(
      info.brigadeResponding
    );
    await parentResponseCard.locator("#responding").click();
    await parentResponseCard.locator("#arrived").click();
    try {
      await parentResponseCard
        .locator('//li/button[@class="button"]')
        .click({ timeout: 5000 });
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
    await this.page
      .locator("text=" + incident.callsignCode + "K1 - Responding >> button")
      .click();
    await Promise.all([
      this.page.waitForNavigation(),
      this.changeApplicationStatusModalYes.click(),
    ]);
    // await expect(await this.noIncidentTitle).toBeVisible();
    await this._expectNoIncideInProgress();
  }
  async respondDirectToIncident(info) {
    console.log(info);
    const incident = info.incident;
    await expect(await this.incidentInProgress).toBeVisible();
    await expect(await this.headerInRed).toBeVisible(); // to check for red color
    await Promise.all([
      this.page.waitForNavigation(),
      this.incidentBell.first().click(),
    ]);
    await expect(await this.incidentDetailsTitle).toBeVisible();
    await expect(await this.callsignCodeDetails.first()).toHaveText(
      incident.callsignCode
    );

    let callSoruceCodePostfix = "AIRH";
    if (incident.eventType.toLowerCase() === "vegetation") {
      callSoruceCodePostfix = "VEG";
    }
    await expect(await this.callSourceCodeDetails.first()).toHaveText(
      incident.callSourceCode + " - " + callSoruceCodePostfix
    );
    const addressTitle = incident.addressTitle;
    await expect(await this.incidentPlaceName.first()).toContainText(
      addressTitle.toUpperCase()
    );
    await expect(await this.incidentDescription.first()).toHaveText(
      incident.incidentNoteText + " #" + incident.cadNumber
    );
    const parentResponseCard = await this.getResponseCardLocatorFor(
      info.brigadeRespondingDirect
    );
    if (info.isBlackWatchEnabled) {
      await parentResponseCard.locator("#responding").click();
      await this.page.waitForTimeout(2000);
    } else {
      await parentResponseCard.locator("#responding").click({ delay: 3000 });
    }
    const iconCircleClasses = await parentResponseCard
      .locator(".icon.circle")
      .getAttribute("class");
    const respondingClasses = await parentResponseCard
      .locator("#responding")
      .getAttribute("class");

    await expect(iconCircleClasses, "Icon circle is not blue").toContain(
      "blue"
    );
    await expect(respondingClasses, "Responding button is not blue").toContain(
      "active to incident"
    );
    await parentResponseCard.locator("#arrived").click();
    const applianceOptionsClasses = await parentResponseCard
      .locator('div[role="listbox"]')
      .getAttribute("class");
    await expect(
      applianceOptionsClasses,
      "Appliance options are not disabled"
    ).toContain("disabled");
    if (info.brigadeResponding) {
      await this.applianceTab.click();
      incident.brigadeResponding = info.brigadeResponding;
      console.log(info);
      await this._respondToIncident(incident);
    }
  }
  async validateThresholdShortageBannerText(text) {
    let thresholdtext = undefined;
    try {
      await this.page.waitForTimeout(2000);
      // adding timeout because it takes time to load, else thresholdShortage text will return empty
      thresholdtext = await this.thresholdShortageText.textContent();
      console.log("banner text", thresholdtext);
      return thresholdtext.includes(text);
    } catch (err) {
      return false;
    }
  }

  async getAllMessages({ isDescending }) {
    await this.page.locator(".messages.list.lists.big").waitFor();
    let messages = [];
    let date = [];
    const totalMessages = await this.page.locator(".message.card").count();

    for (let i = 0; i < totalMessages; ++i) {
      const messageCard = await this.page.locator(".message.card").nth(i);
      const messageDate = await messageCard.locator(".date").textContent();
      date.push(messageDate);
      messages.push(await messageCard.allTextContents());
    }

    // validating if message Date is in descending order
    if (isDescending) this._validateMessageTimeLineInDescendingOrder(date);
    return messages;
  }

  async _validateMessageTimeLineInDescendingOrder(date) {
    date = date.map((date) => date.replace("'", "").trim());
    let dates = [...date];

    console.log("Dates", dates);

    // validating mins
    const inMins = date.filter((d) => d.includes("min ago"));
    const timeInMins = dates.splice(0, inMins.length);
    expect(inMins).toEqual(timeInMins); // to check if removed mins are the first n elements
    console.log("inMins", inMins);

    console.log("Dates", dates);

    // mins order validation
    for (let i = 0; i < inMins.length - 1; ++i) {
      if (
        Number(inMins[i + 1].match(/(\d+)/)[0]) <
        Number(inMins[i].match(/(\d+)/)[0])
      ) {
        throw "Validating message time line (mins) failed.";
      }
    }

    // validating hours
    const inHours = date.filter((d) => d.match(/(\d+:\d+)/));
    const timeInHours = dates.splice(0, inHours.length);
    expect(inHours).toEqual(timeInHours); // to check if removed hours are the second n elements
    console.log("inHours", inHours);

    console.log("Dates", dates);

    // hours order validation
    for (let i = 0; i < inHours.length - 1; ++i) {
      const currentNumH = Number(inHours[i].split(":")[0]);
      const nextNumH = Number(inHours[i + 1].split(":")[0]);
      const currentNumM = Number(inHours[i].split(":")[1]);
      const nextNumM = Number(inHours[i + 1].split(":")[1]);
      if (nextNumH > currentNumH) {
        throw "Validating message time line (mins) failed.";
      } else if (nextNumH == currentNumH) {
        if (nextNumM > currentNumM) {
          throw "Validating message time line (mins) failed.";
        }
      }
    }
    // validating yesterdays
    const yesterday = date.filter((d) => d.match("Yesterday"));
    const timeAsYesterday = dates.splice(0, yesterday.length);
    expect(yesterday).toEqual(timeAsYesterday); // to check if removed yesterday are the third n elements
    console.log("yesterday", yesterday);

    console.log("Dates", dates);
    // validating dates
    const inDateFormat = date.filter((d) => d.match(/(\d+\/\d+\/\d+)/));
    const timeInDateFormat = dates; // dates array should all left with time in date format
    expect(inDateFormat).toEqual(timeInDateFormat);
    for (let i = 0; i < inDateFormat.length - 1; ++i) {
      const currentDate = Number(inDateFormat[i].split("/")[0]);
      const currentMonth = Number(inDateFormat[i].split("/")[1]);
      const nextDate = Number(inDateFormat[i + 1].split("/")[0]);
      const nextMonth = Number(inDateFormat[i + 1].split("/")[1]);
      if (
        (currentDate < nextDate && currentMonth <= nextMonth) ||
        (currentDate >= nextDate && currentMonth < nextMonth)
      ) {
        throw "Validating message time line (day and month) failed.";
      }
    }
  }

  async getCurrentBrigade() {
    return await this.selectedBrigade.textContent();
  }

  async selectBrigadeFromDropdown(brigadeName) {
    await this.selectedBrigade.click();
    await this.page.locator(".header.controls >> text=" + brigadeName).click();
    expect(
      await this.getCurrentBrigade(),
      "Brigade is not selected as expected"
    ).toEqual(brigadeName);
  }

  async validateAndCloseCoverMoveIncident(incident) {
    const { callsignCode, station, commonEventIdentifier } = incident;

    expect(await this.isIncidentInProgress()).toBeTruthy();
    await this.clickIncidentBell();
    const callSignCodeLocator = await this.incidentDetails.locator(
      ".callSignCodes"
    );
    const codeLocator = await this.incidentDetails.locator(".code");
    const placeNameLocator = await this.incidentDetails.locator(".place.name");
    const descriptionLocator = this.incidentDetails.locator(".description");
    expect(
      await callSignCodeLocator.textContent(),
      "Call Sign code is not same"
    ).toEqual(callsignCode);
    expect(await codeLocator.textContent(), "Code is not same").toEqual(
      "COMCEN - COVERMOVE"
    );
    expect(
      await placeNameLocator.textContent(),
      "Station Place name is not same"
    ).toEqual(station);
    const expectedDescriptions =
      callsignCode +
      " - COVER MOVE TO " +
      station +
      " #" +
      commonEventIdentifier +
      "-" +
      callsignCode;
    expect(
      await descriptionLocator.textContent(),
      "Description is not same"
    ).toEqual(expectedDescriptions);
    await this.incidentCloseIcon.first().click();
    await this.incidentDeleteButton.click();
    await expect(await this.noIncidentTitle).toBeVisible({ timeout: 50000 });
    await this._expectNoIncideInProgress();
  }

  async getRespondingETA(member) {
    const memInfo = member || Utilitypage.GetUser().admin.name;
    const parentResponseCard = await this.getResponseCardLocatorFor(memInfo);
    await parentResponseCard.locator("#responding").click();
    const etaLocator = await this.respondingEta;
    const etaText = etaLocator.textContent();
    await this.page.waitForTimeout(1000);
    await parentResponseCard.locator("#responding").click();
    await this.page.waitForTimeout(500);
    await this.changeApplicationStatusModalYes.click();
    return etaText;
  }

  async validateMapMarkersAndIncident() {
    expect(await this.isIncidentInProgress()).toBeTruthy();
    await this.clickIncidentBell();
    await this.page.waitForTimeout(5000);
    // expect(await this.page.locator(".leaflet-marker-icon")).toBeVisible();
    // await this.page.pause();
    // const mapMarkerWrapper = await this.page.locator(
    //   ".leaflet-pane.leaflet-marker-pane"
    // );
    // expect(await this.page.locator("//div[@class='leaflet-pane leaflet-marker-pane']")).toBeVisible();
    // expect(await mapMarkerWrapper.locator("img")).toBeVisible();
    // expect(await mapMarkerWrapper.locator(".brigade.map.icon")).toBeVisible();
    // leaflet-pane leaflet-marker-pane
    // leaflet-marker-icon leaflet-zoom-animated leaflet-interactive
    // leaflet-marker-icon map-marker brigade leaflet-zoom-animated leaflet-interactive
    // brigade map icon
  }
}

module.exports = { HomePage };
