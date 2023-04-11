const { test, expect } = require("@playwright/test");
const { USER_CONSTANTS } = require("../config/constant");
const { Utilitypage } = require("../utils/UtilityPage");
const { NavigationPage } = require("../pages/NavigationPage");
var customParseFormat = require("dayjs/plugin/customParseFormat");
const dayjs = require("dayjs");

class AvailabilityPage {
  constructor(page) {
    this.page = page;

    this.gridCell = page.locator("//td[@role='gridcell']");
    //Create New Entry
    this.newEntry = page.locator("//button[normalize-space()='New Entry']");
    this.newCalandarEntryLabel = page.locator(
      "//h2[normalize-space()='New Calendar Entry']"
    );
    this.entryTypeUnavailable = page.locator(
      "//label[normalize-space()='Unavailable']"
    );
    this.datePickerStart = page.locator(
      "//span[@aria-controls='startdate_dateview']"
    );
    this.datePickerEnd = page.locator(
      "//span[@aria-controls='enddate_dateview']"
    );
    this.saveButton = page.locator("//button[@id='save']");
    // After entry is created
    // this.createdAvailabilityEntryOnHomePage = page.locator(
    //   "//td[@class='k-today unavailable k-state-selected' or @class='k-today k-state-selected' or @class='k-today standby k-state-selected']/following-sibling::td[1]"
    // );

    this.createdAvailabilityEntryOnHomePage = page
      .locator(".k-today")
      .locator("//following-sibling::td")
      .first();

    this.unavailableAndStandbyEntries = page.locator(
      "//td[@role='gridcell' and @class='unavailable' or @class='unavailable standby' or @class='standby']"
    );

    this.createdEntryUnderMyCalendar = page.locator(
      "//div[@class='unavailability card']/h5[contains(text(),'Unavailable')]"
    );
    // Delete entry page
    this.deleteEntryButton = page.locator(
      "//button[normalize-space()='Delete Entry']"
    );
    this.deleteEntryPopupConfirmationWindow = page.locator(
      "//p[normalize-space()='Are you sure you want to delete this entry?']"
    );
    this.deleteButton = page.locator("//button[normalize-space()='Delete']");
    // Repeat Entry
    this.repeatEntry = page.locator("#repeatentry");
    this.editEntryPopupConfirmationWindow = page.locator(
      "//h3[normalize-space()='Edit Entry']"
    );
    this.editRepetedSeriesRadioButton = page.locator(
      "//label[normalize-space()='Edit repeated series']"
    );
    this.editButton = page.locator("//button[normalize-space()='Edit']");
    // Member Calendar
    this.memberCalendarButton = page.locator(
      "//button[normalize-space()='Member Calendar']"
    );
    this.selectMemberWindow = page.locator(
      "//h3[normalize-space()='Select Member to View']"
    );
    this.selectFirstMember = page.locator(
      "(//div[@class='member card'])[1]/div/div/h4"
    );
    this.selectButton = page.locator("//button[normalize-space()='Select']");

    // Member Banner class
    this.memberCalendarBanner = page.locator(
      "//div[@class='member calendar banner']"
    );
    this.memberCalendarCloseButton = page.locator(
      "//div[@class='member calendar banner']/button"
    );
    this.maxFutureDateError = page.locator(
      "//span[normalize-space()='Must be after End.']"
    );
    this.threeWeeksDateError = page.locator(
      "//div[normalize-space()='Validation Failed']"
    );
  }

  selectTomorrowsStartDate(name) {
    return this.page.locator("(//a[@title='" + name + "'])");
  }

  selectTomorrowsEndDate(name, day) {
    return this.page.locator(
      "(//a[@title='" + name + "'][normalize-space()='" + day + "'])[2]"
    );
  }

  repeatEntryDropdown(repeatDays) {
    return this.page.locator("//div[normalize-space()='" + repeatDays + "']");
  }

  async createAndDeleteAvailabilityEntry() {
    dayjs.extend(customParseFormat);
    var tomorrowsDate = dayjs().add(1, "day").format("dddd, MMMM DD, YYYY");
    var tomorrowsDateOnly = dayjs().add(1, "day").format("DD");
    var tomorrowsDay = dayjs().add(1, "day").format("DD");
    await this.newEntry.click();
    await this.entryTypeUnavailable.click();
    await this.datePickerStart.click();
    await this.page.waitForLoadState("networkidle");
    await this.selectTomorrowsStartDate(tomorrowsDate, tomorrowsDay).click();
    await this.saveButton.click();
    await this.page.waitForTimeout(2000);
    // await this.page.pause();
    let createdAvailability = await this.page
      .locator("//*[text()='" + tomorrowsDateOnly + "']/..")
      .first();
    let classes = await createdAvailability.getAttribute("class");
    if (classes.includes("date passed")) {
      createdAvailability = await this.page
        .locator("//*[text()='" + tomorrowsDateOnly + "']/..")
        .nth(1);
    }
    await expect(await createdAvailability).toHaveClass("unavailable");
    await createdAvailability.click();
    await this.page.waitForTimeout(4000);
    await this.createdEntryUnderMyCalendar.click();
    await this.page.waitForLoadState("networkidle");
    await this.deleteEntryButton.click();
    await expect(
      this.deleteEntryPopupConfirmationWindow,
      "Delete this group popup window is not displaying"
    ).toBeVisible();
    await this.deleteButton.click();
    await this.page.waitForTimeout(2000);
    await createdAvailability.click();
    await expect(
      this.createdEntryUnderMyCalendar,
      "Created availability entry is not deleted"
    ).toBeHidden();
  }

  async createAndDeleteRepeatAvailabilityEntry(repeatEntryTimeline) {
    dayjs.extend(customParseFormat);
    var tomorrowsDate = dayjs().add(1, "day").format("dddd, MMMM DD, YYYY");
    var tomorrowsDay = dayjs().add(1, "day").format("DD");
    var tomorrowsDateOnly = dayjs().add(1, "day").format("DD");

    await this.newEntry.click();
    await this.entryTypeUnavailable.click();
    await this.datePickerStart.click();
    await this.page.waitForLoadState("networkidle");
    await this.selectTomorrowsStartDate(tomorrowsDate, tomorrowsDay).click();

    await this.repeatEntry.click();
    await this.page.waitForTimeout(2000);
    await this.repeatEntryDropdown(repeatEntryTimeline).click();
    await this.saveButton.click();
    await this.page.waitForTimeout(2000);
    let createdAvailability = await this.page
      .locator("//*[text()='" + tomorrowsDateOnly + "']/..")
      .first();
    let classes = await createdAvailability.getAttribute("class");
    if (classes.includes("date passed")) {
      createdAvailability = await this.page
        .locator("//*[text()='" + tomorrowsDateOnly + "']/..")
        .nth(1);
    }
    await expect(await createdAvailability).toHaveClass("unavailable");
    await createdAvailability.click();
    await this.page.waitForTimeout(2000);
    await this.createdEntryUnderMyCalendar.click();

    await expect(
      this.editEntryPopupConfirmationWindow,
      "Edit repeated entry popup window is not displaying"
    ).toBeVisible();
    await this.editRepetedSeriesRadioButton.click();
    await this.editButton.click();

    await this.page.waitForTimeout(2000);
    await this.deleteEntryButton.click();
    await expect(
      this.deleteEntryPopupConfirmationWindow,
      "Delete this group popup window is not displaying"
    ).toBeVisible();
    await this.deleteButton.click();
    await this.page.waitForTimeout(2000);
    await expect(await createdAvailability).not.toHaveClass("unavailable");
    await createdAvailability.click();
    await expect(
      this.createdEntryUnderMyCalendar,
      "Created availability entry is not deleted"
    ).toBeHidden();
  }

  async createAndDeleteAvailabilityEntryOnBehalfMember() {
    dayjs.extend(customParseFormat);
    var tomorrowsDate = dayjs().add(1, "day").format("dddd, MMMM DD, YYYY");
    var tomorrowsDay = dayjs().add(1, "day").format("DD");
    var tomorrowsDateOnly = dayjs().add(1, "day").format("DD");

    await this.memberCalendarButton.click();
    await this.selectFirstMember.click();
    await this.selectButton.click({ timeout: 5000 });
    await this.page.waitForTimeout(2000);

    await this.deleteAvailabilityEntries(); // Cleanup if there is an existing entry
    await expect(
      this.memberCalendarBanner,
      "Viewing: member calendar banner is not displaying"
    ).toBeVisible();
    await this.newEntry.click();
    await this.entryTypeUnavailable.click();
    await this.datePickerStart.click();
    await this.page.waitForLoadState("networkidle");
    await this.selectTomorrowsStartDate(tomorrowsDate, tomorrowsDay).click();
    await this.saveButton.click();
    await this.page.waitForTimeout(2000);
    let createdAvailability = await this.page
      .locator("//*[text()='" + tomorrowsDateOnly + "']/..")
      .first();
    let classes = await createdAvailability.getAttribute("class");
    if (classes.includes("date passed")) {
      createdAvailability = await this.page
        .locator("//*[text()='" + tomorrowsDateOnly + "']/..")
        .nth(1);
    }
    await expect(await createdAvailability).toHaveClass("unavailable");
    await createdAvailability.click();

    await this.page.waitForTimeout(2000);
    await this.createdEntryUnderMyCalendar.click();

    await this.page.waitForLoadState("networkidle");
    await this.deleteEntryButton.click();
    await expect(
      this.deleteEntryPopupConfirmationWindow,
      "Delete this group popup window is not displaying"
    ).toBeVisible();
    await this.deleteButton.click();
    await this.page.waitForTimeout(2000);
    await createdAvailability.click();
    await expect(
      this.createdEntryUnderMyCalendar,
      "Created availability entry is not deleted"
    ).toBeHidden();
  }

  async createMaximumFutureDateEntry() {
    dayjs.extend(customParseFormat);
    const maxDate = dayjs().add(6, "year").format("DD/MM/YYYY HH:00");
    await this.newEntry.click();
    await this.entryTypeUnavailable.click();
    await this.repeatEntry.click();
    await this.page.waitForTimeout(2000);
    await this.repeatEntryDropdown("Every 10 Days").click();
    await this.page.evaluate((maxDate) => {
      document.getElementById("enddate").value = maxDate;
    }, maxDate);
    await this.page.waitForTimeout(1000);
    await this.datePickerEnd.click();
    await this.page.waitForTimeout(1000);
    await this.datePickerEnd.click();
    await this.saveButton.click();
    await this.page.waitForTimeout(2000);
    await expect(
      this.maxFutureDateError,
      "Maximum future date error is not displaying"
    ).toBeVisible();
  }

  async createEntryBeyondThreeWeeks() {
    dayjs.extend(customParseFormat);
    const maxDate = dayjs().add(2, "month").format("DD/MM/YYYY HH:00");
    await this.newEntry.click();
    await this.entryTypeUnavailable.click();
    await this.repeatEntry.click();
    await this.page.waitForTimeout(2000);
    await this.repeatEntryDropdown("Every 3 Weeks").click();
    await this.page.evaluate((maxDate) => {
      document.getElementById("enddate").value = maxDate;
    }, maxDate);
    await this.page.waitForTimeout(1000);
    await this.datePickerEnd.click();
    await this.page.waitForTimeout(1000);
    await this.datePickerEnd.click();
    await this.saveButton.click();
    await this.page.waitForTimeout(2000);
    await expect(
      this.threeWeeksDateError,
      "Beyond 3 weeks date error is not displaying"
    ).toBeVisible();
  }

  async deleteAvailabilityEntries() {
    await this.gridCell.first().waitFor({ timeout: 5000 });
    await this.page.waitForTimeout(3000);
    let totalUnavailableEntries =
      await this.unavailableAndStandbyEntries.count();
    console.log("Total existing enteries ", totalUnavailableEntries);
    while (totalUnavailableEntries > 0) {
      await this.unavailableAndStandbyEntries.first().click();
      const unavailabilityCard = await this.page.locator(
        ".unavailability.card"
      );
      await unavailabilityCard.first().click();
      try {
        await this.deleteEntryButton.click({ timeout: 2000 });
        await expect(
          this.deleteEntryPopupConfirmationWindow,
          "Delete this group popup window is not displaying"
        ).toBeVisible();
      } catch (e) {
        await expect(
          this.editEntryPopupConfirmationWindow,
          "Edit repeated entry popup window is not displaying"
        ).toBeVisible();
        await this.editRepetedSeriesRadioButton.click();
        await this.editButton.click();
        await this.deleteEntryButton.click({ timeout: 1000 });
      }
      await this.deleteButton.click();
      await this.page.waitForTimeout(2000);
      totalUnavailableEntries = await this.unavailableAndStandbyEntries.count();
      console.log("Total existing enteries ", totalUnavailableEntries);
    }
  }
  catch(e) {
    console.log("No existing enteries found.");
  }
}

module.exports = { AvailabilityPage };
