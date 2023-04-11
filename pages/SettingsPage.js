const { test, expect } = require("@playwright/test");
const { USER_CONSTANTS } = require("../config/constant");

var memberName;
class SettingsPage {
  constructor(page) {
    this.page = page;
    this.brigadeDetails = page.locator("//h3[text()='Brigade Details']");
    this.brigadeMembers = page.locator("//h3[text()='Brigade Members']");
    this.appliances = page.locator("//h3[text()='Appliances']");
    this.activeMembersTab = page.locator("//span[text()='Active Members']");
    this.deactivedMembersTab = page.locator(
      "//span[text()='Deactivated Members']"
    );

    // Popup window for deactivating/removing member
    this.removeBrigadeMemberPopupConfirmation = page.locator(
      "//h3[text()='Remove Brigade Member']"
    );
    this.removeRadioButton = page.locator("//label[text()='Remove']");
    this.deactivateRadioButton = page.locator("//label[text()='Deactivate']");
    this.cancelButton = page.locator("//button[normalize-space()='Cancel']");
    this.removeButton = page.locator("//button[text()=' Remove ']");
    this.saveButton = page.locator("//button[text()='Save']");
    this.employeeIdInput = page.locator("#employeeid");

    // Add new user locators
    this.addNewUserButton = page.locator("//button[text()=' New User ']");
    this.newAddMemberPopupWindow = page.locator(
      "//h3[text()='Add New Brigade Member']"
    );
    this.employeeIDTextbox = page.locator("//input[@id='employeeid']");
    this.addButton = page.locator("//button[normalize-space()='Add']");
    this.memberToBeAddedName = page.locator("//p[@id='name']");
    this.memberToBeAddedEmployeeID = page.locator("//p[@id='employeeid']");
    this.brigadeMemberPositionDropdown = page.locator(
      "//div[@id='role']/div[@class='text']"
    );
    this.brigadeMemeberEtaLocator = page.locator("#eta");
    // Activate and Deactivate devices
    this.addDevice = page.locator("text=Add Device");
    this.deviceNameInput = page.locator('input[name="deviceName"]');
    this.secretInput = page.locator('input[name="secret"]');
    this.popupAddDeviceButton = page.locator(".new.device.field >> button");
    this.popupCloseButton = page.locator("text=Close");
    this.pendingActivation = page.locator("text=Pending Activation");
    this.deleteDeviceButton = page.locator("text=Delete");
    this.popupDeactivateButton = page.locator('button:has-text("Deactivate")');
    this.popupDeleteButton = page.locator(".modal.inner >> .delete.button");
    this.disableAllNotificationsCheckbox = page.locator(
      'input[name="DisableAll"]'
    );

    // brigade notifications
    this.disableAllNotificationsInput = page.locator("//*[@id='disableall']");
    this.saveBrigadePageButton = page.locator("//button[text()='Save']");
    this.selfIncidentLabel = page.locator(
      "text= Self Incidents has been enabled for this brigade "
    );
  }

  async selfIncideEnabled(status) {
    if (status) {
      await expect(
        await this.selfIncidentLabel,
        "Self Incident enabled label is missing"
      ).toBeVisible({ timeout: 10000 });
    }
  }

  // Active Member locators
  getActiveMemberName(name) {
    return this.page.locator(
      "//div[@class='member card']/div/div/h4[contains(text(),'" + name + "')]"
    );
  }

  activeMemberEditButton(name) {
    return this.page.locator(
      "//div[@class='member card']/div/div/h4[contains(text(),'" +
        name +
        "')]/following::button[1]"
    );
  }

  activeMemberDeleteButton(name) {
    return this.page.locator(
      "//div[@class='member card']/div/div/h4[contains(text(),'" +
        name +
        "')]/following::button[2]"
    );
  }

  // Deactive Member locators
  getDeactivatedMemberName(name) {
    return this.page.locator(
      "//div[@class='simple member card']/div/h4[contains(text(),'" +
        name +
        "')]"
    );
  }

  deactivatedMemberEditButton(name) {
    return this.page.locator(
      "//div[@class='simple member card']/div/h4[contains(text(),'" +
        name +
        "')]/following::button[1]"
    );
  }

  deactivatedMemberDeleteButton(name) {
    return this.page.locator(
      "//div[@class='simple member card']/div/h4[contains(text(),'" +
        name +
        "')]/following::button[2]"
    );
  }
  async navigateToBrigadeMembers() {
    const currentUrl = await this.page.url();
    if (!currentUrl.includes("settings/brigademembers")) {
      this.page.goto("/settings/brigademembers");
    }
  }
  async getBrigadeActiveMemberCard(memberName) {
    return await this.page.locator(
      "//h4[text()=' " + memberName + " ']//ancestor::div[@class='member card']"
    );
  }
  async deactivateAndActivateMember() {
    console.log(
      "Member to de-activate -------> " + USER_CONSTANTS.BRIGADE_TO_DEACTIVATE
    );
    memberName = USER_CONSTANTS.BRIGADE_TO_DEACTIVATE;
    await this.brigadeMembers.click();
    if ((await this.getActiveMemberName(memberName).count()) == 0) {
      await this.deactivedMembersTab.click();
      await expect(
        this.getDeactivatedMemberName(memberName),
        "Member is not visible in deactivated list"
      ).toBeVisible();
      await this.deactivatedMemberEditButton(memberName).click();
      await this.saveButton.scrollIntoViewIfNeeded({ timeout: 5000 });
      await this.page.waitForTimeout(2000);
      await this.saveButton.click();
      await this.page.waitForLoadState("networkidle");
    }

    await this.getActiveMemberName(memberName).scrollIntoViewIfNeeded();
    await expect(
      this.getActiveMemberName(memberName),
      "Member is not visible in active members list"
    ).toBeVisible();
    console.log(
      "Member Name ------> " +
        (await this.getActiveMemberName(memberName).textContent())
    );

    await expect(
      this.activeMemberDeleteButton(memberName),
      "Delete button for deactivating member is not visible"
    ).toBeVisible();
    await this.activeMemberDeleteButton(memberName).click();

    await expect(
      this.removeBrigadeMemberPopupConfirmation,
      "Remove Brigade Member popup window is not displaying"
    ).toBeVisible();
    await this.deactivateRadioButton.click();
    await this.removeButton.click();
    await expect(
      this.getActiveMemberName(memberName),
      "Member is not deactivated"
    ).toBeHidden();

    await this.deactivedMembersTab.click();
    await expect(
      this.getDeactivatedMemberName(memberName),
      "Member is not visible in deactivated list"
    ).toBeVisible();
    await this.deactivatedMemberEditButton(memberName).click();

    await this.saveButton.scrollIntoViewIfNeeded({ timeout: 5000 });
    await this.page.waitForTimeout(2000);
    await this.saveButton.click();
    await this.page.waitForLoadState("networkidle");
    await this.getActiveMemberName(memberName).scrollIntoViewIfNeeded();
    await expect(
      this.getActiveMemberName(memberName),
      "Member is not activated again"
    ).toBeVisible();
  }

  async activateAndDeleteMember() {
    console.log(
      "Member to Add -------> " +
        USER_CONSTANTS.BRIGADE_TO_ACTIVATE_EMPLOYEE_NAME
    );
    memberName = USER_CONSTANTS.BRIGADE_TO_ACTIVATE_EMPLOYEE_NAME;
    await this.brigadeMembers.click();
    await this.page.waitForLoadState("networkidle");
    if ((await this.getActiveMemberName(memberName).count()) > 0) {
      await this.getActiveMemberName(memberName).scrollIntoViewIfNeeded();
      await this.activeMemberDeleteButton(memberName).click();
      await expect(
        this.removeBrigadeMemberPopupConfirmation,
        "Remove Brigade Member popup window is not displaying"
      ).toBeVisible();
      await this.removeRadioButton.click();
      await this.page.waitForTimeout(2000);
      await this.removeButton.click();
      await this.page.waitForLoadState("networkidle");
    }

    await expect(
      this.getActiveMemberName(memberName),
      "Member is already activated"
    ).toBeHidden();
    await this.addNewUserButton.click();
    await expect(
      this.newAddMemberPopupWindow,
      "Add new brigade member is not displaying"
    ).toBeVisible();
    await this.employeeIDTextbox.type(
      USER_CONSTANTS.BRIGADE_TO_ACTIVATE_EMPLOYEE_ID,
      { delay: 30 }
    );
    await this.addButton.click();
    await this.saveButton.scrollIntoViewIfNeeded({ timeout: 5000 });
    await this.page.waitForTimeout(3000);
    await this.saveButton.click();
    await this.page.waitForLoadState("networkidle");
    await this.getActiveMemberName(memberName).scrollIntoViewIfNeeded();
    await expect(
      this.getActiveMemberName(memberName),
      "Member is not activated again"
    ).toBeVisible();

    //Delete same member
    await expect(
      this.activeMemberDeleteButton(memberName),
      "Delete button for removing member is not visible"
    ).toBeVisible();
    await this.activeMemberDeleteButton(memberName).click();
    await expect(
      this.removeBrigadeMemberPopupConfirmation,
      "Remove Brigade Member popup window is not displaying"
    ).toBeVisible();
    await this.removeRadioButton.click();
    await this.page.waitForTimeout(2000);
    await this.removeButton.click();
    console.log("Member Deleted -------> " + memberName);
    await this.page.waitForLoadState("networkidle");
    await expect(
      this.getActiveMemberName(memberName),
      "Member is not deactivated"
    ).toBeHidden();
  }

  async activateAndDeactivateDevice(member) {
    const memName = member || USER_CONSTANTS.BRIGADE_TO_ACTIVATE_DEVICE;
    await this.brigadeMembers.click();
    await this.activeMemberEditButton(memName).click();
    await this.addDevice.click();
    await this.deviceNameInput.click();
    await this.deviceNameInput.fill("sd1");
    await this.secretInput.click();
    await this.secretInput.fill("1");
    await this.popupAddDeviceButton.click();
    await this.popupCloseButton.click();
    expect(await this.pendingActivation).toBeVisible();
    await this.deleteDeviceButton.click();
    await this.popupDeactivateButton.click();
    await this.page.waitForTimeout(2000);
  }

  async activateDevice(member) {
    const memName = member || USER_CONSTANTS.BRIGADE_TO_ACTIVATE_DEVICE;
    const deviceName = "Device " + Math.floor(Math.random() * 1000);
    const deviceSecret = Math.floor(Math.random() * 1000).toString();
    await this.brigadeMembers.click();
    await this.activeMemberEditButton(memName).click();
    await this.addDevice.click();
    await this.deviceNameInput.click();
    await this.deviceNameInput.fill(deviceName);
    await this.secretInput.click();
    await this.secretInput.fill(deviceSecret);
    await this.popupAddDeviceButton.click();
    await this.page.waitForTimeout(2000);
    const devicePin = await this.page.evaluate(
      () => document.getElementById("devicepin").value
    );
    await this.popupCloseButton.click();
    await this.page.waitForTimeout(2000);
    await expect(await this.getDeviceNameLocator(deviceName)).toBeVisible();
    return { devicePin, deviceName, deviceSecret };
  }

  async getDeviceNameLocator(deviceName) {
    return await this.page.locator(
      "//*[@id='" + deviceName.replace(" ", "").toLowerCase() + "']"
    );
  }

  async getDeviceStatusText(deviceName) {
    return await this.page
      .locator(
        "//*[@id='" +
          deviceName.replace(" ", "").toLowerCase() +
          "']/following-sibling::p"
      )
      .textContent();
  }

  async clickDeviceDeactivateButton(deviceName) {
    return await this.page
      .locator(
        "//*[@id='" +
          deviceName.replace(" ", "").toLowerCase() +
          "']/following-sibling::button[2]"
      )
      .click();
  }

  async clickDeviceDeleteButton(deviceName) {
    return await this.page
      .locator(
        "//*[@id='" +
          deviceName.replace(" ", "").toLowerCase() +
          "']/following-sibling::button[2]"
      )
      .click();
  }

  async deactivateAndDeleteDevice({ deviceName, isDeviceActivated, member }) {
    const memName = member || USER_CONSTANTS.BRIGADE_TO_ACTIVATE_DEVICE;
    await this.brigadeMembers.click();
    await this.activeMemberEditButton(memName).click();
    await this.page.waitForTimeout(2000);
    const status = await this.getDeviceStatusText(deviceName);
    if (isDeviceActivated) {
      await expect(status).toContain("Activated");
      await this.clickDeviceDeactivateButton(deviceName);
    } else {
      await expect(status).toContain("Pending Activation");
      await this.clickDeviceDeleteButton(deviceName);
    }
    await this.popupDeleteButton.click();
    await expect(await this.page.locator("text=" + deviceName)).toBeUndefined;
  }

  async getMemberCard(member) {
    return await this.page.locator(
      "//h4[contains(text(),'" +
        member +
        "')]/ancestor::div[@class='member card']"
    );
  }

  async changeNotificationsForBrigadeMember({ disableAll, member }) {
    const memName = member || USER_CONSTANTS.BRIGADE_TO_ACTIVATE_DEVICE;
    await this.brigadeMembers.click();
    await this.activeMemberEditButton(memName).click();
    await this.disableAllNotificationsInput.waitFor();
    await this.disableAllNotificationsInput.scrollIntoViewIfNeeded({
      timeout: 5000,
    });
    if (disableAll) {
      const isNotificationDisabled =
        await this.disableAllNotificationsInput.isChecked();
      console.log("is notification disbaled: ", isNotificationDisabled);
      console.log("do we want to disable it: ", disableAll);
      await this.page.waitForTimeout(1000);
      if (!isNotificationDisabled && disableAll) {
        console.log("disabling Notifications");
        await this.disableAllNotificationsInput.click();
      }
      await this.page.waitForTimeout(1000); // wait for it to make the changes before saving it
      await this.saveBrigadePageButton.click();
      await this.page.waitForTimeout(500);
      const memberCard = await this.getMemberCard(memName);
      await expect(
        await memberCard.locator("text='All Notifications Disabled'"),
        "All notifications disabled text missing"
      ).toBeVisible();
    } else {
      await this.page.waitForTimeout(500); // needed here otherwise it doesnt click on it
      await this.disableAllNotificationsInput.uncheck();
      await this.saveBrigadePageButton.click();
      await this.page.waitForTimeout(500);
      const memberCard = await this.getMemberCard(memName);
      await expect(
        await memberCard.locator("text='All Notifications Disabled'"),
        "All notifications disabled"
      ).toBeHidden(); // rgb for green color
    }
  }

  async removeBrigadeMemeberIfExist(name) {
    await this.brigadeMembers.click();
    try {
      const memberCardLocator = await this.getBrigadeActiveMemberCard(name);
      await memberCardLocator.locator(".trash").click({timeout: 5000});
      await this.removeRadioButton.click();
      await this.removeButton.click();
      return true;
    } catch (e) {
      return false;
    }
  }

  async addNewBrigadeMember(member) {
    const { employeeId, name, position, eta, notificationsDisabled } = member;
    await this.addNewUserButton.click();
    await this.employeeIdInput.fill(String(employeeId));
    await this.page.waitForTimeout(2000);
    await Promise.all([
      this.page.waitForNavigation({timeout: 5000}),
      this.addButton.click(),
    ]);
    await this.page.waitForTimeout(1000);
    expect(
      await this.memberToBeAddedName,
      "Member name is not correct"
    ).toContainText(name);
    expect(
      await this.memberToBeAddedEmployeeID,
      "Employee Id is not correct"
    ).toContainText(String(employeeId));
    try {
      const positionDropdown = await this.brigadeMemberPositionDropdown;
      expect(positionDropdown).toContainText(position);
    } catch (e) {
      await this.page.locator("//div[@id='role']").click();
      await this.page
        .locator("//*[@id='role']/div/div[text()='Chief Fire Officer (CFO)']")
        .click();
    }
    console.log(await this.brigadeMemberPositionDropdown.textContent());
    await this.brigadeMemeberEtaLocator.fill(eta);
    const isNotificationDisabled =
      await this.disableAllNotificationsInput.isChecked();
    console.log("is notification disbaled: ", isNotificationDisabled);
    console.log("do we want to disable it: ", notificationsDisabled);
    if (!isNotificationDisabled && notificationsDisabled) {
      console.log("disabling Notifications");
      await this.disableAllNotificationsInput.click();
    } else if (!notificationsDisabled && isNotificationDisabled) {
      console.log("Enabling notifications");
      await this.disableAllNotificationsInput.uncheck();
    }
    await this.page.waitForTimeout(1000);
    await Promise.all([this.page.waitForNavigation(), this.saveButton.click()]);
    await this.page.waitForLoadState("networkidle");
    await expect(await this.getBrigadeActiveMemberCard(name)).toBeVisible({
      timeout: 10000,
    });
  }

  async validateBrigadeMemberETAChangeErrorMessages(name) {
    await this.brigadeMembers.click();

    const memberCardLocator = await this.getBrigadeActiveMemberCard(name);
    const editButton = await memberCardLocator.locator("button").first();
    await editButton.click();
    await this.brigadeMemeberEtaLocator.waitFor({ timeout: 5000 });
    // checking with 0
    await this.brigadeMemeberEtaLocator.fill("0");
    await expect(
      await this.page.locator("text=The ETA field must be 1 or more")
    ).toBeVisible();

    // checking with number greater then 123
    await this.brigadeMemeberEtaLocator.fill("123");
    await expect(
      await this.page.locator("text=The ETA field must be 120 or less")
    ).toBeVisible();

    // checking with empty string
    await this.brigadeMemeberEtaLocator.fill("");
    await expect(await this.page.locator("text=Must be numeric")).toBeVisible();
  }
  async _updateAttrbiteOfBrigadeMember({ add, member, attributes }) {
    // await this.page.pause();
    const currentUrl = await this.page.url();
    if (!currentUrl.includes("settings/brigademembers")) {
      this.page.goto("/settings/brigademembers");
    }
    // await this.page.pause();
    await this.page.waitForTimeout(500);

    await this.activeMemberEditButton(member).click();
    for (let attribute of attributes) {
      await this.page.waitForTimeout(500);
      const element = await this.page.locator(
        "//label[text()=' " + attribute + " ']/preceding-sibling::input"
      );
      const isElementChecked = await element.isChecked();
      if ((add && !isElementChecked) || (!add && isElementChecked)) {
        await element.click();
      }
    }
    await this.saveButton.click();
  }
  async addAttributesToBrigadeMember({ member, attributes }) {
    await this._updateAttrbiteOfBrigadeMember({
      add: true,
      member,
      attributes,
    });
  }
  async removeAttributesToBrigadeMember({ member, attributes }) {
    await this._updateAttrbiteOfBrigadeMember({
      add: false,
      member,
      attributes,
    });
  }
  async validateAttributes({ member, attributes, isChecked }) {
    // await this.page.pause();
    const currentUrl = await this.page.url();
    if (!currentUrl.includes("settings/brigademembers")) {
      this.page.goto("/settings/brigademembers");
    }
    // await this.page.pause();
    await this.page.waitForTimeout(500);

    await this.activeMemberEditButton(member).click();
    for (let attribute of attributes) {
      await this.page.waitForTimeout(500);
      const element = await this.page.locator(
        "//label[text()=' " + attribute + " ']/preceding-sibling::input"
      );
      const isElementChecked = await element.isChecked();
      console.log(
        attribute +
          " check status is " +
          isElementChecked +
          ", expected: " +
          isChecked
      );
      expect(
        isElementChecked,
        attribute +
          " check status is " +
          isElementChecked +
          ", expected: " +
          isChecked
      ).toEqual(isChecked);
    }
    await this.cancelButton.first().click();
  }

  async validateAttributesWithDifferentStatus({ member, attributes }) {
    const currentUrl = await this.page.url();
    if (!currentUrl.includes("settings/brigademembers")) {
      this.page.goto("/settings/brigademembers");
    }
    await this.page.waitForTimeout(500);

    await this.activeMemberEditButton(member).click();

    for (const [key, value] of Object.entries(attributes)) {
      console.log(`${key}: ${value}`);
      await this.page.waitForTimeout(500);
      const element = await this.page.locator(
        "//label[text()=' " + key + " ']/preceding-sibling::input"
      );
      const isElementChecked = await element.isChecked();
      console.log(
        key + " check status is " + isElementChecked + ", expected: " + value
      );
      expect(
        isElementChecked,
        key + " check status is " + isElementChecked + ", expected: " + value
      ).toEqual(value);
    }
    await this.cancelButton.first().click();
  }

  /* 
    Read about this method in MethodDetails.md document
  */
  async _changeNotification({ category, typeAndStatus }) {
    const locatorId = category + typeAndStatus.type;
    const notificationCheckbox = await this.page.locator(
      "#" + locatorId.toLowerCase()
    );
    if (typeAndStatus.status) {
      await notificationCheckbox.check();
    } else {
      await notificationCheckbox.uncheck();
    }
  }
  /* 
    Read about this method in MethodDetails.md document
  */
  async _changeNotificationAndSave({ category, typeAndStatus }) {
    await this._changeNotification({ category, typeAndStatus });
    await this.saveButton.scrollIntoViewIfNeeded({ timeout: 5000 });
    await this.saveButton.click({ timeout: 2000 });
  }
  /* 
    Read about this method in MethodDetails.md document
  */
  async _validateNotification({ category, typeAndStatus, isDisabled = false }) {
    const locatorId = category + typeAndStatus.type;
    const notificationCheckbox = await this.page.locator(
      "#" + locatorId.toLowerCase()
    );
    if (isDisabled) {
      expect(
        await notificationCheckbox.getAttribute("disabled"),
        locatorId + " Checkbox is not disabled"
      ).toEqual("disabled");
    } else {
      expect(
        await notificationCheckbox.getAttribute("disabled"),
        locatorId + " Checkbox is disabled"
      ).toBeNull();
    }
    if (typeAndStatus.status) {
      await expect(await notificationCheckbox.isChecked()).toBeTruthy();
    } else {
      await expect(await notificationCheckbox.isChecked()).toBeFalsy();
    }
  }

  /* 
    Read about this method in MethodDetails.md document
  */
  async _validateNotificationAndSave({ category, typeAndStatus, isDisabled }) {
    await this._validateNotification({ category, typeAndStatus, isDisabled });
    await this.saveButton.scrollIntoViewIfNeeded({ timeout: 5000 });
    await this.saveButton.click({ timeout: 2000 });
  }

  async validateNotificationsCheckbox({ member, notificationType }) {
    let category;
    let typeAndStatus;
    await this.navigateToBrigadeMembers();
    if (notificationType.toLowerCase().includes("message")) {
      console.log("message notifications");
      category = "message";
    } else if (notificationType.toLowerCase().includes("brigade threshold")) {
      console.log("brigade threshold notifications");
      category = "threshold";
    }
    await this.activeMemberEditButton(member).click();

    typeAndStatus = { type: "TextMessage", status: true };
    await this._changeNotificationAndSave({ category, typeAndStatus });

    await this.activeMemberEditButton(member).click();
    await this._validateNotification({
      category,
      typeAndStatus: { type: "TextMessage", status: true },
    });
    await this._changeNotificationAndSave({
      category,
      typeAndStatus: { type: "MobilePhone", status: true },
    });
    await this.activeMemberEditButton(member).click();
    await this._validateNotification({
      category,
      typeAndStatus: { type: "TextMessage", status: false },
    });
    await this._changeNotificationAndSave({
      category,
      typeAndStatus: { type: "Landline", status: true },
    });
    await this.activeMemberEditButton(member).click();
    await this._validateNotification({
      category,
      typeAndStatus: { type: "Landline", status: true },
    });
    await this._changeNotificationAndSave({
      category,
      typeAndStatus: { type: "AlternativeContact", status: true },
    });
    await this.activeMemberEditButton(member).click();
    await this._validateNotificationAndSave({
      category,
      typeAndStatus: { type: "Landline", status: false },
    });
  }

  // method is a child method of AlertAndThresholdNotifications
  async _getCurrentStateOf_AlertAndThresholdNotifications(category) {
    return {
      textmessage: await this.page
        .locator("#" + category.toLowerCase() + "textmessage")
        .isChecked(),
      mobilephone: await this.page
        .locator("#" + category.toLowerCase() + "mobilephone")
        .isChecked(),
      landline: await this.page
        .locator("#" + category.toLowerCase() + "landline")
        .isChecked(),
      alternativecontact: await this.page
        .locator("#" + category.toLowerCase() + "alternativecontact")
        .isChecked(),
    };
  }

  // method is a child method of AlertAndThresholdNotifications
  async _changeToDefault_AlertAndThresholdNotifications(
    category,
    currentState
  ) {
    await this._changeNotification({
      category,
      typeAndStatus: { type: "textmessage", status: currentState.textmessage },
    });
    await this._changeNotification({
      category,
      typeAndStatus: { type: "mobilephone", status: currentState.mobilephone },
    });
    await this._changeNotification({
      category,
      typeAndStatus: { type: "landline", status: currentState.landline },
    });
    await this._changeNotification({
      category,
      typeAndStatus: {
        type: "alternativecontact",
        status: currentState.alternativecontact,
      },
    });

    await this.saveButton.scrollIntoViewIfNeeded({ timeout: 5000 });
    await this.saveButton.click({ timeout: 2000 });
  }

  // method is a child method of AlertAndThresholdNotifications
  async _checkAllAndSave_AlertAndThresholdNotifications(category) {
    await this._changeNotification({
      category,
      typeAndStatus: { type: "textmessage", status: true },
    });
    await this._changeNotification({
      category,
      typeAndStatus: { type: "mobilephone", status: true },
    });
    await this._changeNotification({
      category,
      typeAndStatus: { type: "landline", status: true },
    });
    await this._changeNotification({
      category,
      typeAndStatus: { type: "alternativecontact", status: true },
    });

    await this.saveButton.scrollIntoViewIfNeeded({ timeout: 5000 });
    await this.saveButton.click({ timeout: 2000 });
  }

  // method is a child method of AlertAndThresholdNotifications
  async _validateAllAndSave_AlertAndThresholdNotifications(category) {
    await this._validateNotification({
      category,
      typeAndStatus: { type: "textmessage", status: true },
    });
    await this._validateNotification({
      category,
      typeAndStatus: { type: "mobilephone", status: true },
    });
    await this._validateNotification({
      category,
      typeAndStatus: { type: "landline", status: true },
    });
    await this.page.pause();

    await this._validateNotificationAndSave({
      category,
      typeAndStatus: { type: "alternativecontact", status: true },
    });
  }

  async validateIncidentAlertAndThresholdNotifications({ member, state }) {
    let category;
    await this.navigateToBrigadeMembers();
    await this.activeMemberEditButton(member).click();

    switch (state.toLowerCase().replace(" ", "")) {
      case "available":
        category = "incidentCallToAction";
        break;
      case "unavailable":
        category = "incidentInfoOnly";
        break;
      case "standby":
        category = "incidentStandby";
        break;
    }
    const currentState =
      await this._getCurrentStateOf_AlertAndThresholdNotifications(category);
    console.log(currentState);

    // checking all notifications
    await this._checkAllAndSave_AlertAndThresholdNotifications(category);
    await this.activeMemberEditButton(member).click();
    await this._validateAllAndSave_AlertAndThresholdNotifications(category);
    // reverting to default state
    await this.activeMemberEditButton(member).click();
    await this._changeToDefault_AlertAndThresholdNotifications(
      category,
      currentState
    );
  }

  async validateInAppNotificationCheckbox({ member, notificationType }) {
    let category;
    await this.navigateToBrigadeMembers();
    if (notificationType.toLowerCase().includes("message")) {
      console.log("message notifications");
      category = "message";
    } else if (notificationType.toLowerCase().includes("brigade threshold")) {
      console.log("brigade threshold notifications");
      category = "threshold";
    }
    await this.activeMemberEditButton(member).click();

    await this._validateNotificationAndSave({
      category,
      typeAndStatus: { type: "InApp", status: true },
      isDisabled: true,
    });
  }

  async validateTextVisibility(text) {
    const ele = await this.page.locator('"' + text + '"');
    try {
      await ele.waitFor(2000);
      return await ele.isVisible();
    } catch (e) {
      return false;
    }
  }
}

module.exports = { SettingsPage };
