const { test, expect } = require("@playwright/test");

class ThresholdPage {
  constructor(page) {
    this.page = page;

    //Recent Incident Frame
    this.customMessageInput = page.locator("#statustext");
    this.AddNewBrigadeThresholdButton = page.locator(
      "text=Brigade ThresholdsAdd New >> button"
    );
    this.AddNewIncidentThresholdButton = page.locator(
      "text=Incident ThresholdsAdd New >> button"
    );
    this.selectThresholdType = page.locator(
      "text=SelectBrigade ThresholdAppliance ThresholdEvent Threshold"
    );
    this.selectBrigadeThresholdOption = page.locator(
      'div[role="option"]:has-text("Brigade Threshold")'
    );
    this.selectApplianceThresholdTypeOption = page.locator(
      'div[role="option"]:has-text("Appliance Threshold")'
    );
    this.selectEventThresholdTypeOption = page.locator(
      'div[role="option"]:has-text("Event Threshold")'
    );
    this.selectEventTypeOption = page.locator("//div[@id='eventtype']");
    this.selectRespondingApplianceOption = page.locator(
      "//div[@id='appliance']"
    );
    this.selectThresholdNameInput = page.locator(
      'input[name="Threshold Name"]'
    );
    this.selectApplianceThresholdInput = page.locator(
      'div[data-vv-name="Responding Appliance"]'
    );
    this.selectAddButton = page.locator("text=Add").nth(3);
    this.addAttributeButton = page.locator("text=Add Attribute");
    this.attributeOperationalMemberCheckbox = page.locator(
      'input[name="BrigadeFF"]'
    );
    this.attributeOfficerCheckbox = page.locator('input[name="BrigadeOF"]');
    this.attributeWearerCheckbox = page.locator(
      'input[name="Breathing ApparatusBA"]'
    );

    this.addAttributeSaveButton = page.locator("text=Save");
    this.addRuleButon = page.locator("text=Add Rule");
    this.notificationRuleNameInput = page.locator(
      'input[name="Notification Rule Name"]'
    );
    this.selectSendToDropdown = page.locator(".ui.multiple.selection.dropdown");
    this.selectSendToOperationalMemberOption = page.locator(
      "text=Operational Members"
    );
    this.selectSendToOperationalMemberOption = page.locator("text=All Members");
    this.selectSendToAllMemberOption = page.locator("text=All Members");
    this.selectSendToDropdownCloseIcon = page
      .locator(".ui.multiple.selection.dropdown >> i")
      .nth(1);
    this.selectSendANotificationMessageRadio = page.locator(
      "text=Send a notification message"
    );

    this.notificationMessageText = page.locator(
      'textarea[name="App\\/Text Msg\\/Email"]'
    );
    this.notificationVoiceText = page.locator('textarea[name="Voice Call"]');

    this.thresholdTimeMins = page.locator('input[name="Minutes"]');
    this.thresholdTimeSecs = page.locator('input[name="Seconds"]');

    this.includePeopleAvailableStatus = page.locator(
      "#available >> text=Available"
    );
    this.includePeopleUnavailableStatus = page.locator(
      "#unavailable >> text=Unavailable"
    );
    this.includePeopleStandbyStatus = page.locator("#standby >> text=Standby");
    this.doNotContactCheckbox = page.locator(
      "text=Do not send to anyone who has already been contacted for this threshold breach"
    );
    this.doNotContactTurnoutCheckbox = page.locator(
      "text=Do not send to anyone who has already been notified during the current turnout"
    );
    this.addNotificationRuleSaveButton = page.locator("text=Save");
    this.brigadeOperationalMemberCountValue = page
      .locator(".count.text")
      .first();
    this.brigadeOperationalMemberCountIncrement = page
      .locator("i.small.plus.icon")
      .first();
    // this.thresholdActiveCheckbox = page.locator('text=ThresholdsThreshold Active >> input[type="checkbox"]');
    this.thresholdActiveCheckbox = page.locator("text=Threshold Active");
    this.thresholdShortageAlert = page.locator("text=Threshold Shortages");
    this.brigadeThresholdCardList = page.locator(
      "//div[contains(@class,'brigade')]//ul/li"
    );
    this.incidentThresholdCardList = page.locator(
      "//div[contains(@class,'incident')]//ul/li"
    );
    this.baseSiteDeleteButton = page.locator("#ams >> text=Delete");
    this.modalDeleteButton = page.locator(".modal >> button.delete.button");
    this.onImmediateBreakSelect = page.locator("#sendnotification").first();
    this.contactPeopleWihtSkillCheckbox = page.locator("label").nth(2);
    this.notificationRuleList = page.locator(
      "//*[@class='notification rules column']/ul/li//h4[contains(text(), 'Notification Name')]"
    );
  }

  async isDoNotContactTurnoutCheckboxVisible() {
    return await this.doNotContactTurnoutCheckbox.isVisible();
  }

  async validateThresholdStatus(thresholdName, isBroken) {
    const className = isBroken ? "threshold broken" : "threshold met";
    await expect(
      await this.page.locator(
        "//h4[normalize-space()='" +
          thresholdName +
          "']/../span[@class='" +
          className +
          "']"
      )
    ).toBeVisible();
  }

  async getThresholdShortageCount() {
    let text = undefined;
    try {
      text = await this.page.locator(".threshold.controls >> p").textContent();
      var thresholdCount = text.match(/\d/g).join("");
      return thresholdCount;
    } catch (err) {
      return 0;
    }
  }

  async addNewBrigadeThreshold(data) {
    const info = {
      thresholdType: data?.thresholdType || "Brigade",
      thresholdName:
        data?.thresholdName ||
        "Threshold Name " + Math.floor(100 + Math.random() * 900),
      notificationName:
        data?.notificationName ||
        "Notification Name " + Math.floor(100 + Math.random() * 900),
      brigadeOperationalMemberCount: data?.brigadeOperationalMemberCount || 15,
      OnImmediateBreak: data?.OnImmediateBreak || false,
      thresholdTimeMins: data?.thresholdTimeMins || "01",
      doNotContact: data?.doNotContact || false,
      peopleWithStatus: data?.peopleWithStatus || ["Available"],
      onlyContactPeopleWithSkill: data?.onlyContactPeopleWithSkill || false,
    };
    await this.AddNewBrigadeThresholdButton.click();
    await this.selectThresholdType.click();
    if (info.thresholdType == "Brigade") {
      await this.selectBrigadeThresholdOption.click();
    }
    await this.selectThresholdNameInput.click();
    await this.selectThresholdNameInput.fill(info.thresholdName);
    await this.selectAddButton.click();
    await this.addAttributeButton.click();
    await this.attributeOperationalMemberCheckbox.check();
    await this.addAttributeSaveButton.click();
    await this.addRuleButon.click();
    await this.notificationRuleNameInput.fill(info.notificationName);
    await this.selectSendToDropdown.click();
    await this.selectSendToOperationalMemberOption.click();
    await this.selectSendToDropdownCloseIcon.click();
    if (info.onlyContactPeopleWithSkill) {
      await this.contactPeopleWihtSkillCheckbox.click();
    }
    if (info.OnImmediateBreak) {
      await this.onImmediateBreakSelect.click();
    } else {
      await this.thresholdTimeMins.fill(info.thresholdTimeMins);
    }
    if (info.peopleWithStatus.includes("Available")) {
      await this.includePeopleAvailableStatus.click();
    }
    if (info.peopleWithStatus.includes("Unavailable")) {
      await this.includePeopleUnavailableStatus.click();
    }
    if (info.peopleWithStatus.includes("Standby")) {
      await this.includePeopleStandbyStatus.click();
    }
    // info.doNotContact
    if (
      (await this.page.isChecked('//*[@id="donotcontact"]/input')) &&
      !info.doNotContact
    ) {
      await this.doNotContactCheckbox.click();
    }
    await this.addNotificationRuleSaveButton.click();
    while (
      (await this.brigadeOperationalMemberCountValue.textContent()) <
      info.brigadeOperationalMemberCount
    ) {
      await this.page.waitForTimeout(300);
      await this.brigadeOperationalMemberCountIncrement.click();
    }
    await this.thresholdActiveCheckbox.check();
    await Promise.all([
      this.page.waitForNavigation(),
      await this.addNotificationRuleSaveButton.click(),
    ]);
    await this.page.waitForLoadState("networkidle");
    await this.page.reload(); // Do we need this ?
    await this.page.waitForTimeout(2000);
    await expect(await this.thresholdShortageAlert).toBeVisible();
    return info;
  }

  async deleteBrigadeThreshold(info) {
    await this.page.reload();
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState("networkidle");
    const count = await this.brigadeThresholdCardList.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; ++i) {
      const ele = await this.brigadeThresholdCardList.nth(i);
      const text = await ele.textContent();
      if (text.includes(info.thresholdName)) {
        await this.validateThresholdStatus(info.thresholdName, true);
        await this.brigadeThresholdCardList.nth(i).click();
        await this.page
          .locator("h4", { hasText: info.notificationName })
          .click();
        // Rule delete
        await this.baseSiteDeleteButton.click(); // Notification (page) Rule delete button
        await this.page.waitForTimeout(500);
        // Rule delete confirmation delete
        await this.modalDeleteButton.click(); // Modal delete button
        await this.page.waitForTimeout(500);
        // Threshold delete
        await this.baseSiteDeleteButton.click(); // Threshold (page) delete button
        await this.page.waitForTimeout(500);
        // Threshold delete confirmation delete
        await this.modalDeleteButton.click(); // Modal delete button
        break;
      }
    }
  }

  async addNewIncidentThreshold(data) {
    const info = {
      thresholdType: data?.thresholdType || "Appliance",
      applianceType: data?.applianceType || "AUTO001",
      notificationName:
        data?.notificationName ||
        "Notification Name " + Math.floor(100 + Math.random() * 900),
      notificationMessageText:
        data?.notificationMessageText ||
        "Random Notification Message Text" +
          Math.floor(100 + Math.random() * 900),
      notificationVoiceText:
        data?.notificationVoiceText ||
        "Random Notification Message Text" +
          Math.floor(100 + Math.random() * 900),
      brigadeOperationalMemberCount: data?.brigadeOperationalMemberCount || 0,
      brigadeOfficerMemberCount: data?.brigadeOfficerMemberCount || 0,
      wearerAttributeCount: data?.wearerAttributeCount || 0,
      OnImmediateBreak: data?.OnImmediateBreak || false,
      thresholdTimeMins: data?.thresholdTimeMins || "00",
      thresholdTimeSecs: data?.thresholdTimeSecs || "30",
      doNotContact: data?.doNotContact || false,
      peopleWithStatus: data?.peopleWithStatus || ["Available"],
      activateThreshold: data?.activateThreshold || false,
      notificationRuleSendTo: data?.notificationRuleSendTo || [
        "Operational Members",
      ],
      sendANotificationMessage: data?.sendANotificationMessage || false,
      onlyContactPeopleWithSkill: data?.onlyContactPeopleWithSkill || false,
    };
    await this.AddNewIncidentThresholdButton.click();
    await this.selectThresholdType.click();
    await this.selectApplianceThresholdTypeOption.click();
    await this.selectApplianceThresholdInput.click();
    await this.page.waitForTimeout(1000);
    await this.page.locator("text=" + info.applianceType + "").click();
    await Promise.all([
      this.page.waitForNavigation(),
      this.selectAddButton.click(),
    ]);
    await this.selectAddButton.click();
    await this.addAttributeButton.click();
    if (Number(info.brigadeOperationalMemberCount) > 0) {
      await this.attributeOperationalMemberCheckbox.check();
    }
    if (Number(info.brigadeOfficerMemberCount) > 0) {
      await this.attributeOfficerCheckbox.check();
    }
    if (Number(info.wearerAttributeCount) > 0) {
      await this.attributeWearerCheckbox.check();
    }
    await this.addAttributeSaveButton.click();
    await this.addRuleButon.click();
    await this.notificationRuleNameInput.fill(info.notificationName);
    await this.selectSendToDropdown.click();
    if (info.notificationRuleSendTo.includes("All Members")) {
      await this.selectSendToAllMemberOption.click();
    } else {
      await this.selectSendToOperationalMemberOption.click(); // Sending to Operational Member
    }
    await this.selectSendToDropdownCloseIcon.click();
    if (info.onlyContactPeopleWithSkill) {
      await this.contactPeopleWihtSkillCheckbox.click();
    }
    if (info.sendANotificationMessage) {
      await this.selectSendANotificationMessageRadio.click(); // send a notification
      await this.notificationMessageText.fill(info.notificationMessageText);
      await this.notificationVoiceText.fill(info.notificationVoiceText);
    }
    if (info.OnImmediateBreak) {
      await this.onImmediateBreakSelect.click();
    } else {
      await this.thresholdTimeMins.fill(String(info.thresholdTimeMins));
      await this.thresholdTimeSecs.fill(String(info.thresholdTimeSecs));
    }
    if (info.peopleWithStatus.includes("Available")) {
      await this.includePeopleAvailableStatus.click();
    }
    if (info.peopleWithStatus.includes("Unavailable")) {
      await this.includePeopleUnavailableStatus.click();
    }
    if (info.peopleWithStatus.includes("Standby")) {
      await this.includePeopleStandbyStatus.click();
    }
    if (info.sendANotificationMessage) {
      if (
        (await this.page.isChecked('//*[@id="donotcontact"]/input')) &&
        !info.doNotContact
      ) {
        await this.doNotContactTurnoutCheckbox.click();
      }
    }
    await Promise.all([
      this.page.waitForNavigation(),
      this.addNotificationRuleSaveButton.click(),
    ]);
    await this.page.waitForTimeout(500);
    if (Number(info.brigadeOperationalMemberCount) > 0) {
      await this.page
        .locator("text=Brigade - Operational Member 1 >> button")
        .nth(1)
        .click({
          clickCount: info.brigadeOperationalMemberCount - 1,
        });
    }

    await this.page.waitForTimeout(500);
    if (Number(info.brigadeOfficerMemberCount)) {
      await this.page
        .locator("text=Brigade - Officer 1 >> button")
        .nth(1)
        .click({
          clickCount: info.brigadeOfficerMemberCount - 1,
        });
    }
    if (info.activateThreshold) {
      await this.thresholdActiveCheckbox.check();
    }
    await Promise.all([
      this.page.waitForNavigation(),
      this.addNotificationRuleSaveButton.click(),
    ]);
    await this.page.waitForLoadState("networkidle");
    await this.page.reload(); // Do we need this ?
    await this.page.waitForTimeout(2000);
    let thresholdApplianceStatus = info.applianceType;
    if (!info.activateThreshold)
      thresholdApplianceStatus = info.applianceType + " (Inactive)";
    await expect(
      await this.page.locator("h4", { hasText: thresholdApplianceStatus })
    ).toBeVisible();
    return info;
  }

  // NOTE: This method wont create threshold or rule, this is to get into threshold/rule and validate options
  async initiateCreateIncidentAndRule(data) {
    const info = {
      thresholdType: data?.thresholdType || "Appliance",
      applianceType: data?.applianceType || "AUTO001",
      sendANotificationMessage: data?.sendANotificationMessage || false,
      notificationName:
        data?.notificationName ||
        "Notification Name " + Math.floor(100 + Math.random() * 900),
      notificationMessageText:
        data?.notificationMessageText ||
        "Random Notification Message Text" +
          Math.floor(100 + Math.random() * 900),
      notificationVoiceText:
        data?.notificationVoiceText ||
        "Random Notification Message Text" +
          Math.floor(100 + Math.random() * 900),
      notificationRuleSendTo: data?.notificationRuleSendTo || [
        "Operational Members",
      ],
    };
    // Creating incident Threshold
    await this.AddNewIncidentThresholdButton.click();
    await this.selectThresholdType.click();
    await this.selectApplianceThresholdTypeOption.click();
    await this.selectApplianceThresholdInput.click();
    await this.page.waitForTimeout(1000);
    await this.page.locator("text=" + info.applianceType + "").click();
    await Promise.all([
      this.page.waitForNavigation(),
      this.selectAddButton.click(),
    ]);

    //Adding Rule
    await this.addRuleButon.click();
    await this.notificationRuleNameInput.fill(info.notificationName);
    await this.selectSendToDropdown.click();
    if (info.notificationRuleSendTo.includes("All Members")) {
      await this.selectSendToAllMemberOption.click();
    } else {
      await this.selectSendToOperationalMemberOption.click(); // Sending to Operational Member
    }
    await this.selectSendToDropdownCloseIcon.click();
    if (info.sendANotificationMessage) {
      await this.selectSendANotificationMessageRadio.click(); // send a notification
      await this.notificationMessageText.fill(info.notificationMessageText);
      await this.notificationVoiceText.fill(info.notificationVoiceText);
    }
  }

  async deleteIncidentThreshold(info) {
    await this.page.reload();
    await this.page.waitForLoadState("networkidle");
    const count = await this.incidentThresholdCardList.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; ++i) {
      const ele = await this.incidentThresholdCardList.nth(i);
      const text = await ele.textContent();
      let thresholdApplianceStatus = info.applianceType;
      if (!info.activateThreshold)
        thresholdApplianceStatus = info.applianceType + " (Inactive)";
      if (text.includes(thresholdApplianceStatus)) {
        await this.incidentThresholdCardList.nth(i).click();
        await this.page.reload();
        await this.page.waitForLoadState("networkidle");

        const ruleCount = await this.notificationRuleList.count();
        console.log("Total number of rules present", ruleCount);
        if (ruleCount > 0) {
          if (info.notificationName) {
            await this.page
              .locator("h4", { hasText: info.notificationName })
              .click();
            await this.page.waitForTimeout(500);

            // Rule delete
            await this.baseSiteDeleteButton.click(); // Notification (page) Rule delete button
            await this.page.waitForTimeout(500);
            // Rule delete confirmation delete
            await this.modalDeleteButton.click(); // Modal delete button
            await this.page.waitForTimeout(500);
          } else {
            for (let i = 0; i < ruleCount; ++i) {
              await this.page
                .locator("//h4[contains(text(), 'Notification Name')]")
                .first()
                .click();
              // Rule delete
              await this.baseSiteDeleteButton.click(); // Notification (page) Rule delete button
              await this.page.waitForTimeout(500);
              // Rule delete confirmation delete
              await this.modalDeleteButton.click(); // Modal delete button
              await this.page.waitForTimeout(500);
            }
          }
        }
        // Threshold delete
        await this.baseSiteDeleteButton.click(); // Threshold (page) delete button
        await this.page.waitForTimeout(500);
        // Threshold delete confirmation delete
        await this.modalDeleteButton.click(); // Modal delete button
        break;
      }
    }
  }

  async deleteAllBrigadeThresholdsAndRules() {
    console.log("Inside deleteAllBrigadeThresholdsAndRules");
    await this.page.waitForLoadState();
    await this.page.reload();
    await this.page.waitForLoadState("networkidle");
    // get brigade threshold card list
    const brigadeThresholdList = await this.page.locator(
      "//*[contains(@class,'brigade thresholds column')]//*[contains(@class,'threshold card')]"
    );
    const brigadeThresholdListCount = await brigadeThresholdList.count();
    console.log("brigadeThresholdListCount", brigadeThresholdListCount);
    // Looping through all the brigade thresholds
    for (let i = 0; i < brigadeThresholdListCount; ++i) {
      const brigadeThreshold = await brigadeThresholdList.first();
      // delete brigade threshold
      await this._deleteThresholdandAllNotificationRules(brigadeThreshold);
      await this.page.waitForTimeout(500);
    }
  }

  async deleteAllIncidentThresholdsAndRules() {
    console.log("Inside deleteAllIncidentThresholdsAndRules");
    await this.page.waitForLoadState();
    await this.page.reload({ waitUntil: "networkidle" });
    await this.page.waitForLoadState("networkidle");
    // get Appliance threshold card list - when incident thresholds are there
    const applianceThresholdList = await this.page.locator(
      "//*[contains(@class,'appliance threshold card')]"
    );

    const applianceThresholdListCount = await applianceThresholdList.count();
    console.log("applianceThresholdListCount", applianceThresholdListCount);
    // Looping through all the Appliance thresholds under incident thresholds
    for (let i = 0; i < applianceThresholdListCount; ++i) {
      // Note: each appliance Threshold (incident) has one appliance threshold and may have event thresholds
      // getting appliance threshold part from the appliance Threshold (incident)
      const incidentThreshold = await applianceThresholdList.first();
      const applianceThreshold = await incidentThreshold.locator("a").first();
      // jumping into event threshold inside the appliance Threshold (incident)
      const eventThresholds = await incidentThreshold.locator(
        "//div[contains(@class, 'threshold card')]"
      );
      // counting number of event thresholds inside the appliance Threshold (incident) and deleting them with rules in it
      const eventThresholdsCount = await eventThresholds.count();
      for (let j = 0; j < eventThresholdsCount; ++j) {
        const eventThreshold = await eventThresholds.nth(j).first();
        await this._deleteThresholdandAllNotificationRules(eventThreshold);
      }

      // time to delete appliance threshold now as event attached to is deleted
      await this._deleteThresholdandAllNotificationRules(applianceThreshold);
      await this.page.waitForTimeout(500);
    }

    // If any event threshold card is left
    const eventThresholdCardsTotal = await this.page.locator(
      "//div[contains(@class, 'threshold card')]"
    );
    const totalEventThresholdCount = await eventThresholdCardsTotal.count();
    console.log("totalEventThresholdCount", totalEventThresholdCount);
    if (applianceThresholdListCount === 0 && totalEventThresholdCount > 0) {
      for (let i = 0; i < totalEventThresholdCount; ++i) {
        const eventThreshold = await eventThresholdCardsTotal.first();
        await this._deleteThresholdandAllNotificationRules(eventThreshold);
      }
      return;
    }
  }

  async _deleteThresholdandAllNotificationRules(threshold) {
    // Clicking on even threshold
    await Promise.all([this.page.waitForNavigation(), await threshold.click({timeout: 10000})]);
    await this.page.waitForTimeout(1000); // need this to get the count correct
    // find the list of rules
    const notificationRulesList = await this.page.locator(".notification.card");
    const notificationRulesListCount = await notificationRulesList.count();
    // looping through rules and deleting them
    for (let i = 0; i < notificationRulesListCount; ++i) {
      // clicking on first rule, not on i'th rule becuase once first on is deleted then second becomes the first
      await notificationRulesList.first().click(),
        // Notification (page) Rule delete button
        await this.baseSiteDeleteButton.click();
      await this.page.waitForTimeout(500);

      // Rule delete confirmation delete
      await this.modalDeleteButton.click(); // Modal delete button
      await this.page.waitForTimeout(500);
    }

    // Threshold delete
    await this.baseSiteDeleteButton.click(); // Threshold (page) delete button
    await this.page.waitForTimeout(500);
    // Threshold delete confirmation delete
    await this.modalDeleteButton.click(); // Modal delete button
    await this.page.waitForTimeout(500);
    await this.page.reload();
    await this.page.waitForLoadState("networkidle");
  }

  async activateThreshold(info) {
    await this.page.waitForLoadState("networkidle");
    const count = await this.incidentThresholdCardList.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; ++i) {
      const ele = await this.incidentThresholdCardList.nth(i);
      const text = await ele.textContent();
      const thresholdApplianceStatus =
        info.applianceType + !info.activateThreshold && " (Inactive)";
      if (text.includes(thresholdApplianceStatus)) {
        await this.incidentThresholdCardList.nth(i).click();
        // Click to activate
        await this.thresholdActiveCheckbox.check();
        await Promise.all([
          this.page.waitForNavigation(),
          this.addNotificationRuleSaveButton.click(),
        ]);
        break;
      }
    }
    await expect(
      await this.page.locator("h4", { hasText: info.applianceType })
    ).toBeVisible();
    info.activateThreshold = true;
    return info;
  }

  async deActivateThreshold(info) {
    await this.page.waitForLoadState("networkidle");
    const count = await this.incidentThresholdCardList.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; ++i) {
      const ele = await this.incidentThresholdCardList.nth(i);
      const text = await ele.textContent();
      const thresholdApplianceStatus = info.applianceType;
      if (text.includes(thresholdApplianceStatus)) {
        await this.incidentThresholdCardList.nth(i).click();
        // Click to activate
        await this.thresholdActiveCheckbox.uncheck();
        await Promise.all([
          this.page.waitForNavigation(),
          this.addNotificationRuleSaveButton.click(),
        ]);
        break;
      }
    }
    let thresholdApplianceStatus = info.applianceType + " (Inactive)";
    await expect(
      await this.page.locator("h4", { hasText: thresholdApplianceStatus })
    ).toBeVisible();
    info.activateThreshold = false;
    return info;
  }

  async deleteIncidentThresholdIfExist(info) {
    console.log("doesIncidentThresholdExist", info.applianceType);
    await this.page.waitForLoadState("networkidle");
    const statusActive = await this.page
      .locator("text=" + info.applianceType)
      .count();
    if (statusActive) info.activateThreshold = true;
    const statusInactive = await this.page
      .locator("text=" + info.applianceType + " (Inactive)")
      .count();
    if (statusInactive) info.activateThreshold = false;
    console.log("doesIncidentThresholdExist", statusActive, statusInactive);
    if (statusActive || statusInactive)
      await this.deleteIncidentThreshold(info);
  }

  // Create a new event threshold
  async addNewEventThreshold(data) {
    const info = {
      thresholdType: data?.thresholdType || "Event",
      respondingAlliance: data?.respondingAlliance || "AUTO001",
      eventType: data?.eventType || "VEG",
      notificationName:
        data?.notificationName ||
        "Notification Name " + Math.floor(100 + Math.random() * 900),
      notificationMessageText:
        data?.notificationMessageText ||
        "Random Notification Message Text" +
          Math.floor(100 + Math.random() * 900),
      notificationVoiceText:
        data?.notificationVoiceText ||
        "Random Notification Message Text" +
          Math.floor(100 + Math.random() * 900),
      brigadeOperationalMemberCount: data?.brigadeOperationalMemberCount || 10,
      brigadeOfficerMemberCount: data?.brigadeOfficerMemberCount || 0,
      OnImmediateBreak: data?.OnImmediateBreak || false,
      thresholdTimeMins: data?.thresholdTimeMins || "00",
      thresholdTimeSecs: data?.thresholdTimeSecs || "30",
      doNotContact: data?.doNotContact || false,
      peopleWithStatus: data?.peopleWithStatus || ["Available"],
      activateThreshold: data?.activateThreshold || false,
      notificationRuleSendTo: data?.notificationRuleSendTo || [
        "Operational Members",
      ],
      sendANotificationMessage: data?.sendANotificationMessage || false,
    };
    await this.AddNewIncidentThresholdButton.click();
    await this.selectThresholdType.click();
    await this.selectEventThresholdTypeOption.click();
    await this.selectRespondingApplianceOption.click(); // responding appliance locator
    await this.page
      .locator('div[role="option"]:has-text("' + info.respondingAlliance + '")')
      .click();
    await this.selectEventTypeOption.click(); // event type locators
    await this.page.locator("text=" + info.eventType).click();
    await this.selectEventTypeOption.click(); // to close the drop down

    await Promise.all([
      this.page.waitForNavigation(),
      this.selectAddButton.click(),
    ]);
    // await this.selectAddButton.click();
    await this.addAttributeButton.click();
    if (Number(info.brigadeOperationalMemberCount) > 0) {
      await this.attributeOperationalMemberCheckbox.check();
    }
    if (Number(info.brigadeOfficerMemberCount) > 0) {
      await this.attributeOfficerCheckbox.check();
    }
    await this.addAttributeSaveButton.click();
    await this.addRuleButon.click();
    await this.notificationRuleNameInput.fill(info.notificationName);
    await this.selectSendToDropdown.click();
    if (info.notificationRuleSendTo.includes("All Members")) {
      await this.selectSendToAllMemberOption.click();
    } else {
      await this.selectSendToOperationalMemberOption.click(); // Sending to Operational Member
    }
    await this.selectSendToDropdownCloseIcon.click();
    if (info.sendANotificationMessage) {
      await this.selectSendANotificationMessageRadio.click(); // send a notification
      await this.notificationMessageText.fill(info.notificationMessageText);
      await this.notificationVoiceText.fill(info.notificationVoiceText);
    }
    if (info.OnImmediateBreak) {
      await this.onImmediateBreakSelect.click();
    } else {
      await this.thresholdTimeMins.fill(String(info.thresholdTimeMins));
      await this.thresholdTimeSecs.fill(String(info.thresholdTimeSecs));
    }
    if (info.peopleWithStatus.includes("Available")) {
      await this.includePeopleAvailableStatus.click();
    }
    if (info.peopleWithStatus.includes("Unavailable")) {
      await this.includePeopleUnavailableStatus.click();
    }
    if (info.peopleWithStatus.includes("Standby")) {
      await this.includePeopleStandbyStatus.click();
    }
    if (
      (await this.page.isChecked('//*[@id="donotcontact"]/input')) &&
      !info.doNotContact
    ) {
      await this.doNotContactTurnoutCheckbox.click();
    }
    await Promise.all([
      this.page.waitForNavigation(),
      this.addNotificationRuleSaveButton.click(),
    ]);
    await this.page.waitForTimeout(500);
    if (Number(info.brigadeOperationalMemberCount) > 0) {
      await this.page
        .locator("text=Brigade - Operational Member 1 >> button")
        .nth(1)
        .click({
          clickCount: info.brigadeOperationalMemberCount - 1,
        });
    }

    await this.page.waitForTimeout(500);
    if (Number(info.brigadeOfficerMemberCount)) {
      await this.page
        .locator("text=Brigade - Officer 1 >> button")
        .nth(1)
        .click({
          clickCount: info.brigadeOfficerMemberCount - 1,
        });
    }
    if (info.activateThreshold) {
      await this.thresholdActiveCheckbox.check();
    }
    await Promise.all([
      this.page.waitForNavigation(),
      this.addNotificationRuleSaveButton.click(),
    ]);
    await this.page.waitForLoadState("networkidle");
    await this.page.reload(); // Do we need this ?
    await this.page.waitForTimeout(2000);
    let eventTypeStatus = info.eventType;
    if (!info.activateThreshold)
      eventTypeStatus = info.eventType + " (Inactive)";
    await expect(
      await this.page.locator("h4", { hasText: eventTypeStatus })
    ).toBeVisible();
    return info;
  }
}

module.exports = { ThresholdPage };
