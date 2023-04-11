const { test, expect } = require("@playwright/test");
// // shift + option + F pretty format
const { SettingsPage } = require("../pages/SettingsPage");
const { NavigationPage } = require("../pages/NavigationPage");
const { HomePage } = require("../pages/HomePage");
const { ComCenDashboard } = require("../pages/ComCenDashboard");
const { SelfIncidentPage } = require("../pages/SelfIncidentPage");
const { StationDisplayPage } = require("../pages/StationDisplayPage");
const { ProfilePage } = require("../pages/ProfilePage");
const { MessagePage } = require("../pages/MessagePage");

const login = require("./helper/login");

test.describe("Desktop Test", () => {
  let page;
  let context;
  let settingsPage;
  let navigationPage;
  let homePage;
  let selfIncidentPage;
  let stationDisplayPage;
  let profilePage;
  let messagePage;
  test.beforeAll(async ({ browser }) => {
    const browserObj = await login(browser);
    context = browserObj.context;
    page = browserObj.page;
    settingsPage = new SettingsPage(page);
    navigationPage = new NavigationPage(page);
    homePage = new HomePage(page);
    selfIncidentPage = new SelfIncidentPage(page);
    stationDisplayPage = new StationDisplayPage(page);
    profilePage = new ProfilePage(page);
    messagePage = new MessagePage(page);
  });

  test.beforeEach(async () => {
    await page.goto("/");
  });

  test.afterEach(async ({ browser }, testInfo) => {
    console.log(`Finished ${testInfo.title} with status ${testInfo.status}`);
    if (testInfo.status === "failed") {
      const screenshot = await page.screenshot({
        fullPage: true,
      });
      await testInfo.attach(" - Full Screen Capture on Failure - ", {
        body: screenshot,
        contentType: "image/png",
      });
    }
  });

  test("TC 25369: Home - Desktop - Brigade selector drop down", async () => {
    const currentBrigade = await homePage.getCurrentBrigade();
    await homePage.selectBrigadeFromDropdown("Gk-Brigade"); // Test - validation inside
    await homePage.selectBrigadeFromDropdown(currentBrigade); // Cleanup - selecting the default brigade
  });

  test("TC 48850: User should be able to send cover move before sending incident", async () => {
    // cleanup id incident in progress
    await homePage.closeAllIncidentsInProgress();

    // Creating incident
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    let coverMoveIncident = await comcenDashboard.createCoverMoveIncident({
      callsignCode: "AUTO001",
      station: "WELLINGTON CITY",
      commonEventIdentifier: "1213",
    });
    await ComCenPage.close();
    expect(
      await homePage.isIncidentInProgress(),
      "Incidenent is not in progress"
    ).toBeTruthy();
    await homePage.validateAndCloseCoverMoveIncident(coverMoveIncident);
  });

  test("TC 48852: As a System, user should receive a second or subsequent turnout (with the same incident number) for an appliance to respond to an incident that is ongoing.", async () => {
    test.slow();
    // cleanup id incident in progress
    await homePage.closeAllIncidentsInProgress();
    // Creating first Incident
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    incidentAUTO001 = await comcenDashboard.createIncident({
      callsignCode: "AUTO001",
    });
    await ComCenPage.close();
    await homePage.checkIncidentInProgress(incidentAUTO001);
    // Creating second Incident
    [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    comcenDashboard = new ComCenDashboard(ComCenPage);
    incidentAUTO002 = await comcenDashboard.createIncident({
      callsignCode: "AUTO002",
      cadNumber: incidentAUTO001.cadNumber,
    });
    await ComCenPage.close();
    incidentAUTO001.brigadeResponding = "AutoTest Flight 165";
    // incidentAUTO002.brigadeResponding = "AutoTest Flight 166";
    incidentAUTO002.brigadeResponding = "Matthew Batten";
    await homePage.validateAndRespondMultipleIncidents({
      incident1: incidentAUTO001,
      incident2: incidentAUTO002,
    });
  });

  test("TC 48855: Add new user to brigade and check validations are working as expected", async () => {
    const member = {
      employeeId: "256",
      name: "B1 Ivey",
      eta: "10",
      notificationsDisabled: false,
      position: "Chief Fire Officer (CFO)",
    };

    await navigationPage.goToSettingScreen();
    // // remove user if exist
    await settingsPage.removeBrigadeMemeberIfExist(member.name);
    // // create new user
    await settingsPage.addNewBrigadeMember(member);
    // // validate ETA input box
    await settingsPage.validateBrigadeMemberETAChangeErrorMessages(member.name);
    // delete the user
    await settingsPage.removeBrigadeMemeberIfExist(member.name);
  });

  test("TC 49874: Desktop-Brigade Admin-Check whether brigades can create self incidents.", async () => {
    // pre-requisite
    await homePage.closeAllIncidentsInProgress();

    await navigationPage.goToSettingScreen();
    await settingsPage.selfIncideEnabled(true);
    await navigationPage.goToSelfIncident();
    await selfIncidentPage.fillAndSubmitSelfIncidentForm();
    expect(await homePage.isIncidentInProgress()).toBeTruthy();

    //cleanup
    await homePage.closeAllIncidentsInProgress();
  });
  test("TC 49882 25382: Station Display - Appliances Tab - Check Current K Code Status and Incident in progress", async () => {
    // pre-requisite
    await homePage.closeAllIncidentsInProgress();
    // Step 1 : Creating incident
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    let incidentInfo = await comcenDashboard.createIncident({
      callsignCode: "AUTO001",
    });

    // Step 2: adding and activating device and navigating to Station display
    await page.bringToFront();
    await navigationPage.goToSettingScreen();
    const { deviceName, devicePin, deviceSecret } =
      await settingsPage.activateDevice();
    // navigating to station display page
    const StationDisplayTab = await context.newPage();
    stationDisplayPage = new StationDisplayPage(StationDisplayTab);
    await StationDisplayTab.goto("/stationdisplay");
    // activating device
    await stationDisplayPage.activateDevice(devicePin, deviceSecret);

    // step 3: Validate Incident tab - should be in red
    expect(await stationDisplayPage.isIncidentInProgress()).toBeTruthy();
    // Step 4: Change Appliance status to responding
    await stationDisplayPage.changeIncidentToResponding({
      incident: incidentInfo,
      brigadeResponding: "AutoTest Flight 165",
    });
    // Step 5: change Kcode for AUTO001 to K66
    await ComCenPage.bringToFront();
    await comcenDashboard.changeKcode({
      callsignCode: incidentInfo.callsignCode,
      kcodeIdentifier: "K66",
    });
    await ComCenPage.close();
    await StationDisplayTab.bringToFront();
    await stationDisplayPage.changeIncidentToArrived({
      incident: incidentInfo,
      kcodeIdentifier: "K66",
    });
    // Clenup remove device
    await page.bringToFront();
    await page.goto("/settings");
    await settingsPage.deactivateAndDeleteDevice({
      deviceName,
      isDeviceActivated: true,
    });
  });
  test("TC 25377: Home - Station Display - Panel - No Incident in Progress", async () => {
    // pre-requisite
    await homePage.closeAllIncidentsInProgress();
    // checking station display
    await navigationPage.goToSettingScreen();
    const { deviceName, devicePin, deviceSecret } =
      await settingsPage.activateDevice();
    // navigating to station display page
    const StationDisplayTab = await context.newPage();
    stationDisplayPage = new StationDisplayPage(StationDisplayTab);
    await StationDisplayTab.goto("/stationdisplay");
    // activating device
    await stationDisplayPage.activateDevice(devicePin, deviceSecret);

    // step 3: Validate Incident tab - should be in red
    expect(await stationDisplayPage.isIncidentInProgress()).toBeFalsy();

    await page.goto("/settings");
    await settingsPage.deactivateAndDeleteDevice({
      deviceName,
      isDeviceActivated: true,
    });
  });

  test("TC 25402: User Profile - Desktop - Maintain ETA", async () => {
    // pre-requisite
    await homePage.closeAllIncidentsInProgress();
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    let incidentInfo = await comcenDashboard.createIncident({
      callsignCode: "AUTO001",
    });
    await ComCenPage.close();

    await navigationPage.goToProfileScreen();
    // Check eta time
    const currentEta = await profilePage.getCurrentETA();
    // validate eta time
    await homePage.clickIncidentBell();
    const respondingIncidentEta = await homePage.getRespondingETA();
    expect(currentEta.toLowerCase().replace(" ", "")).toContain(
      respondingIncidentEta
    );
    // change eta
    await navigationPage.goToProfileScreen();
    await profilePage.changeETATo("5");
    // Check eta time
    const updatedEta = await profilePage.getCurrentETA();
    expect(updatedEta).toContain("5");
    await homePage.clickIncidentBell();
    const respondingIncidentEtaUpdated = await homePage.getRespondingETA();
    // validate eta time
    expect(updatedEta.toLowerCase().replace(" ", "")).toContain(
      respondingIncidentEtaUpdated
    );
    // cleanup
    await navigationPage.goToProfileScreen();
    await profilePage.changeETATo(currentEta.split(" ")[0]);
    await page.goto("/");

    await homePage.closeAllIncidentsInProgress();
  });

  test("TC 53573: Desktop -The secondary attribute should be enabled automatically if it is not already enabled when the user enables a new Primary attribute.", async () => {
    // cleanup id incident in progress
    await homePage.closeAllIncidentsInProgress();
    // unselecting attributes
    await settingsPage.removeAttributesToBrigadeMember({
      member: "AMSAuto Test",
      attributes: ["Officer", "Officer Qualified"],
    });

    await settingsPage.validateAttributes({
      member: "AMSAuto Test",
      attributes: ["Officer", "Officer Qualified"],
      isChecked: false,
    });

    await settingsPage.addAttributesToBrigadeMember({
      member: "AMSAuto Test",
      attributes: ["Officer"],
    });

    await settingsPage.validateAttributes({
      member: "AMSAuto Test",
      attributes: ["Officer", "Officer Qualified"],
      isChecked: true,
    });
  });

  test("TC 53574: Desktop -The primary attribute should not be enabled when a secondary attribute alone gets enabled.", async () => {
    // cleanup id incident in progress
    await homePage.closeAllIncidentsInProgress();
    // unselecting attributes
    await settingsPage.removeAttributesToBrigadeMember({
      member: "AMSAuto Test",
      attributes: ["Officer", "Officer Qualified"],
    });

    await settingsPage.validateAttributes({
      member: "AMSAuto Test",
      attributes: ["Officer", "Officer Qualified"],
      isChecked: false,
    });

    await settingsPage.addAttributesToBrigadeMember({
      member: "AMSAuto Test",
      attributes: ["Officer Qualified"],
    });

    await settingsPage.validateAttributesWithDifferentStatus({
      member: "AMSAuto Test",
      attributes: {
        Officer: false,
        "Officer Qualified": true,
      },
    });

    // cleanup
    await settingsPage.addAttributesToBrigadeMember({
      member: "AMSAuto Test",
      attributes: ["Officer"],
    });

    await settingsPage.validateAttributes({
      member: "AMSAuto Test",
      attributes: ["Officer", "Officer Qualified"],
      isChecked: true,
    });
  });

  test("TC 53575: Desktop -The secondary attribute should not get disabled from the users profile when a primary attribute is disabled.", async () => {
    // cleanup id incident in progress
    await homePage.closeAllIncidentsInProgress();
    // Pre-requisite attributes
    await settingsPage.addAttributesToBrigadeMember({
      member: "AMSAuto Test",
      attributes: ["Officer"],
    });

    await settingsPage.validateAttributes({
      member: "AMSAuto Test",
      attributes: ["Officer", "Officer Qualified"],
      isChecked: true,
    });

    // removing primary attribute
    await settingsPage.removeAttributesToBrigadeMember({
      member: "AMSAuto Test",
      attributes: ["Officer"],
    });

    await settingsPage.validateAttributesWithDifferentStatus({
      member: "AMSAuto Test",
      attributes: {
        Officer: false,
        "Officer Qualified": true,
      },
    });

    // cleanup
    await settingsPage.addAttributesToBrigadeMember({
      member: "AMSAuto Test",
      attributes: ["Officer"],
    });

    await settingsPage.validateAttributes({
      member: "AMSAuto Test",
      attributes: ["Officer", "Officer Qualified"],
      isChecked: true,
    });
  });

  test("TC 53576: Desktop -The primary attribute should not get disabled from the users profile when a secondary attribute is disabled.", async () => {
    // cleanup id incident in progress
    await homePage.closeAllIncidentsInProgress();
    // Pre-requisite attributes
    await settingsPage.addAttributesToBrigadeMember({
      member: "AMSAuto Test",
      attributes: ["Officer", "Officer Qualified"],
    });

    await settingsPage.validateAttributes({
      member: "AMSAuto Test",
      attributes: ["Officer", "Officer Qualified"],
      isChecked: true,
    });

    // removing secondary attribute
    await settingsPage.removeAttributesToBrigadeMember({
      member: "AMSAuto Test",
      attributes: ["Officer Qualified"],
    });

    await settingsPage.validateAttributesWithDifferentStatus({
      member: "AMSAuto Test",
      attributes: {
        Officer: true,
        "Officer Qualified": false,
      },
    });

    // cleanup
    await settingsPage.addAttributesToBrigadeMember({
      member: "AMSAuto Test",
      attributes: ["Officer", "Officer Qualified"],
    });

    await settingsPage.validateAttributes({
      member: "AMSAuto Test",
      attributes: ["Officer", "Officer Qualified"],
      isChecked: true,
    });
  });

  test("TC 53572: Desktop: On sending a message from the AMS app,  the associated brigade name is contained within the text message received by the recipients.", async () => {
    // Note: Member: AutoTest Flight 164 is a mobile app user.
    const mobileAppUser = "AutoTest Flight 164";
    const searchText = "164";
    await navigationPage.goToMessageScreen();
    await messagePage.validateExistanceOfMessageFrom(mobileAppUser, searchText); // if search text is not passed then it will search for mobileAppUser
  });

  test("TC 53845: Desktop - The user should be able to select only one out of the four options in under the brigade threshold and messaging notification section.", async () => {
    await navigationPage.goToSettingScreen();
    await settingsPage.validateNotificationsCheckbox({
      member: "AutoTest Flight 164",
      notificationType: "Brigade Threshold Notifications",
    });

    await settingsPage.validateNotificationsCheckbox({
      member: "AutoTest Flight 164",
      notificationType: "Message Notifications",
    });
  });

  test("TC 53848: Desktop - The In App Notification should always be on.", async () => {
    await navigationPage.goToSettingScreen();
    await settingsPage.validateInAppNotificationCheckbox({
      member: "AutoTest Flight 164",
      notificationType: "Brigade Threshold Notifications",
    });
    await settingsPage.validateInAppNotificationCheckbox({
      member: "AutoTest Flight 164",
      notificationType: "Message Notifications",
    });
  });

  test("TC 55417: Desktop - User should be able to enable more than one option from Incident Alert and Threshold Notifications.", async () => {
    await navigationPage.goToSettingScreen();
    await settingsPage.validateIncidentAlertAndThresholdNotifications({
      member: "AutoTest Flight 164",
      state: "Available",
    });

    await settingsPage.validateIncidentAlertAndThresholdNotifications({
      member: "AutoTest Flight 164",
      state: "Standby",
    });

    await settingsPage.validateIncidentAlertAndThresholdNotifications({
      member: "AutoTest Flight 164",
      state: "Unavailable",
    });
  });

  // in progress
  test.skip("TC 48851: Home and destination should be displayed in map on desktop", async () => {
    // cleanup id incident in progress
    await homePage.closeAllIncidentsInProgress();
    // Creating second Incident
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    incidentAUTO001 = await comcenDashboard.createIncident({
      callsignCode: "AUTO001",
    });
    await ComCenPage.close();
    await homePage.validateMapMarkersAndIncident();
  });
});
