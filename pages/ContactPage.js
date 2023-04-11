const { test, expect } = require("@playwright/test");
const { Utilitypage } = require("../utils/UtilityPage");
var customParseFormat = require("dayjs/plugin/customParseFormat");
const dayjs = require("dayjs");
const { ThresholdPage } = require("./ThresholdPage");
const {
  OFFICER_ATTRIBUTES,
  CREW_ATTRIBUTES,
  DRIVER_ATTRIBUTES,
} = require("../config/constant");

var titleNum;
var messageTitle;

class ContactPage {
  constructor(page) {
    this.page = page;

    //Recent Incident Frame
    this.availableStatus = page.locator("#availablestatus");
    this.unavailableStatus = page.locator("#unavailablestatus");
    this.standbyStatus = page.locator("#standbystatus");
    this.calendarstatus = page.locator("#calendarstatus");
    this.memberCardList = page.locator(".member.card");
  }

  async changeStatusTo({ status, member }) {
    await this.page.locator('[placeholder="Search"]').fill(member);
    await this.page
      .locator("text=" + member)
      .first()
      .click();
    if (status == "Available") {
      await this.availableStatus.click();
      await expect(await this.page.locator('h2:has-text("A")')).toBeVisible();
    } else if (status == "Unavailable") {
      await this.unavailableStatus.click();
      await expect(await this.page.locator('h2:has-text("U")')).toBeVisible();
    } else if (status == "Standby") {
      await this.standbyStatus.click();
      await expect(await this.page.locator('h2:has-text("S")')).toBeVisible();
    } else {
      await this.calendarstatus.click();
      await expect(await this.page.locator('h2:has-text("A")')).toBeVisible();
    }
  }

  getDriverCrewOfficerCount = async () => {
    // itereate throught all contacts - ignore Unavailable ones
    /* NOTE:
    Crew is a count of the "Operational Member" attribute
    Officer is a count of "Officer Qualified" OR "Officer" OR "Crew Leader" OR "Fire Officer" OR "Op Support Officer" attributes
     */
    // setting default values
    let driver = 0,
      crew = 0,
      officer = 0;
    const totalMembers = await this.memberCardList.count();
    for (let i = 0; i < totalMembers; ++i) {
      const member = await this.memberCardList.nth(i);
      const memberStatusIcon = await member.locator(".status.icon");
      const memberStatus = await memberStatusIcon.getAttribute("class");
      if (!memberStatus.toLowerCase().includes("unavailable")) {
        //ignoring unavailable members
        let memberName = await member.locator("h4").textContent();
        memberName = memberName.split("(")[0].trim();
        await member.click();
        await expect(await this.page.locator(".user.name")).toHaveText(
          memberName
        );
        const attributesDiv = this.page
          .locator("div:below(:text('Attributes'))")
          .first();
        const attributes = await attributesDiv.textContent();
        if (!attributes.includes("None")) {
          // ignore members with no attribute
          const officerStatus = OFFICER_ATTRIBUTES.some((attribute) =>
            attributes.includes(attribute)
          );
          const crewStatus = CREW_ATTRIBUTES.some((attribute) =>
            attributes.includes(attribute)
          );
          const driverStatus = DRIVER_ATTRIBUTES.some((attribute) =>
            attributes.includes(attribute)
          );
          if (officerStatus) {
            officer += 1;
            continue;
          }
          if (driverStatus) {
            driver += 1;
            continue;
          }
          if (crewStatus) {
            crew += 1;
            continue;
          }
        }
      }
    }
    return { driver, crew, officer };
  };

  markAllDriversUnavailable = async () => {
    const driverState = new Map();
    const totalMembers = await this.memberCardList.count();
    for (let i = 0; i < totalMembers; ++i) {
      const member = await this.memberCardList.nth(i);
      const memberStatusIcon = await member.locator(".status.icon");
      const memberStatus = await memberStatusIcon.getAttribute("class");
      if (!memberStatus.toLowerCase().includes("unavailable")) {
        let memberName = await member.locator("h4").textContent();
        memberName = memberName.split("(")[0].trim();
        await member.click();
        await expect(await this.page.locator(".user.name")).toHaveText(
          memberName
        );
        const attributesDiv = this.page
          .locator("div:below(:text('Attributes'))")
          .first();
        const attributes = await attributesDiv.textContent();
        if (!attributes.includes("None")) {
          const driverStatus = DRIVER_ATTRIBUTES.some((attribute) =>
            attributes.includes(attribute)
          );
          await this.page.locator();
          if (driverStatus) {
            driverState.set(memberName, await this._getSelectedMemberStatus());
            await this.unavailableStatus.click();
            await expect(
              await this.page.locator('h2:has-text("U")')
            ).toBeVisible();
          }
        }
      }
    }
    return driverState;
  };

  _getSelectedMemberStatus = async () => {
    if (await this.availableStatus.locator("input").isChecked()) {
      return "Available";
    } else if (await this.unavailableStatus.locator("input").isChecked()) {
      return "Unavailable";
    } else if (await this.standbyStatus.locator("input").isChecked()) {
      return "Standby";
    } else {
      return "Calendar Status";
    }
  };

  markAllDriversStateTo = async (driverState) => {
    await this.page.reload();
    for (let driver of driverState.keys()) {
      await this.changeStatusTo({ member: driver, status: driverState.get(driver) });
    }
  }
}

module.exports = { ContactPage };
