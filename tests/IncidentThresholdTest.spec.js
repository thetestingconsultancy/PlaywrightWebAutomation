const { test, expect } = require("@playwright/test");
const login = require("./helper/login");
const { ThresholdPage } = require("../pages/ThresholdPage");
const { NavigationPage } = require("../pages/NavigationPage");
const { HomePage } = require("../pages/HomePage");
const { ComCenDashboard } = require("../pages/ComCenDashboard");

test.describe("Incident Threshold Test", () => {
  let context;
  let page;
  let navigationPage;
  let thresholdPage;
  let homePage;
  test.beforeAll(async ({ browser }) => {
    const browserObj = await login(browser);
    context = browserObj.context;
    page = browserObj.page;
    navigationPage = new NavigationPage(page);
    homePage = new HomePage(page);
    thresholdPage = new ThresholdPage(page);
  });

  test.beforeEach(async () => {
    // Prerequisite Setup
    await homePage.closeAllIncidentsInProgress();
    await navigationPage.goToThresholdScreen();
    await thresholdPage.deleteAllBrigadeThresholdsAndRules();
    await thresholdPage.deleteAllIncidentThresholdsAndRules();
  });

  test.afterEach(async ({browser}, testInfo) => {
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

  test("TC 37393: Incident threshold should be triggered for same appliance for which the callsign code is sent", async () => {
    let incident;
    await thresholdPage.addNewIncidentThreshold({
      thresholdType: "Appliance",
      applianceType: "AUTO001",
      brigadeOperationalMemberCount: 10,
      brigadeOfficerMemberCount: 4,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Unavailable"],
      notificationRuleSendTo: ["All Members"],
      activateThreshold: true,
      sendANotificationMessage: true,
    });

    // Creating Incident
    const [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    incident = await comcenDashboard.createIncident({
      callsignCode: "AUTO001",
    });
    await ComCenPage.close();
    // Validating banner
    expect(
      await homePage.validateThresholdShortageBannerText(
        "Officer (4) | Operational Member (10)"
      )
    ).toBeTruthy();

    incident && (await homePage.checkIncidentAndCloseInProgress(incident));
  });

  test("TC 37394: Incident threshold should not trigger when appliance and callsigncode are not same", async () => {
    let incident;
    await thresholdPage.addNewIncidentThreshold({
      thresholdType: "Appliance",
      applianceType: "AUTO001",
      brigadeOperationalMemberCount: 10,
      brigadeOfficerMemberCount: 4,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Unavailable"],
      notificationRuleSendTo: ["All Members"],
      activateThreshold: true,
      sendANotificationMessage: true,
    });

    // Creating Incident
    await homePage.getRecentIncidentsHeader().isVisible;
    console.log("Navigating to comcen page");
    const [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    incident = await comcenDashboard.createIncident({
      callsignCode: "AUTO002",
    });
    await ComCenPage.close();
    // Validating banner
    expect(
      await homePage.validateThresholdShortageBannerText(
        "Officer (4) | Operational Member (10)"
      )
    ).toBeFalsy();
    incident && (await homePage.checkIncidentAndCloseInProgress(incident));
  });

  test("TC 37399 37397 37398: User should be able to create incident threshold with appliance, also, delete rule and threshold", async () => {
    await thresholdPage.addNewIncidentThreshold({
      thresholdType: "Appliance",
      applianceType: "AUTO001",
      brigadeOperationalMemberCount: 10,
      brigadeOfficerMemberCount: 4,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Available"],
      sendANotificationMessage: true,
    });
    await thresholdPage.deleteAllIncidentThresholdsAndRules();
  });

  test("TC 37400: User should be able to create event threshold", async () => {
    // creating new incident threshold
    await thresholdPage.addNewIncidentThreshold({
      thresholdType: "Appliance",
      applianceType: "AUTO001",
      brigadeOperationalMemberCount: 10,
      brigadeOfficerMemberCount: 4,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Available"],
      sendANotificationMessage: true,
    });

    // creating new event threshold
    await thresholdPage.addNewEventThreshold({
      thresholdType: "Event",
      respondingAlliance: "AUTO001",
      eventType: "VEG",
      brigadeOperationalMemberCount: 10,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Unavailable"],
      activateThreshold: true,
      notificationRuleSendTo: ["All Members"],
      sendANotificationMessage: true,
    });

    // Creating incident
    const [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    incidentInfo = await comcenDashboard.createIncident({
      callsignCode: "AUTO001",
      eventType: "Vegetation",
    });
    await ComCenPage.close();

    // validating banner
    expect(
      await homePage.validateThresholdShortageBannerText(
        "Operational Member (10)"
      )
    ).toBeTruthy();

    // responding to incident and closing it with validation that there is no current incident
    await homePage.respondIncidentAndCloseInProgress({
      incident: incidentInfo,
      brigadeResponding: "AutoTest Flight 165",
    });
  });

  test("TC 37402: User should be able to activate and deactivate incident threshold", async () => {
    let info;
    info = await thresholdPage.addNewIncidentThreshold({
      thresholdType: "Appliance",
      applianceType: "AUTO001",
      brigadeOperationalMemberCount: 10,
      brigadeOfficerMemberCount: 4,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Available"],
      sendANotificationMessage: true,
    });
    info = await thresholdPage.activateThreshold(info);
    await page.waitForTimeout(2000);
    info = await thresholdPage.deActivateThreshold(info);
  });

  test("TC 37403: When incident threshold is happening , brigade threshold automatically becomes inactive even it its active", async () => {
    let thresholdInfo;
    let incidentInfo;

    // Check if Incident in progress
    if (await homePage.isIncidentInProgress()) {
      console.log("Incident is already in place");
    } else {
      // Creating incident
      const [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
      let comcenDashboard = new ComCenDashboard(ComCenPage);
      incidentInfo = await comcenDashboard.createIncident({
        callsignCode: "AUTO001",
      });
      await ComCenPage.close();
    }
    // Create incident threshold
    thresholdInfo = await thresholdPage.addNewIncidentThreshold({
      thresholdType: "Appliance",
      applianceType: "AUTO001",
      brigadeOperationalMemberCount: 10,
      brigadeOfficerMemberCount: 4,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Available"],
      activateThreshold: true,
      sendANotificationMessage: true,
    });
    await page.waitForTimeout(1000);

    expect(await homePage.noCurrentThresholdShortageVisiblity()).toBeTruthy();
    // Clean up incident
    incidentInfo &&
      (await homePage.checkIncidentAndCloseInProgress(incidentInfo));
  });

  test("TC 37416: User should be able to send multiple appliance to one incident and threshold breach is updated accordingly", async () => {
    let incidentThresholdAUTO001;
    let incidentThresholdAUTO002;

    incidentThresholdAUTO001 = await thresholdPage.addNewIncidentThreshold({
      thresholdType: "Appliance",
      applianceType: "AUTO001",
      brigadeOperationalMemberCount: 10,
      brigadeOfficerMemberCount: 4,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Unavailable"],
      sendANotificationMessage: true,
      notificationRuleSendTo: ["All Members"],
      activateThreshold: true,
    });

    incidentThresholdAUTO002 = await thresholdPage.addNewIncidentThreshold({
      thresholdType: "Appliance",
      applianceType: "AUTO002",
      wearerAttributeCount: 5,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Unavailable"],
      sendANotificationMessage: true,
      notificationRuleSendTo: ["All Members"],
      activateThreshold: true,
    });

    // Creating incident
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    let incidentInfo1 = await comcenDashboard.createIncident({
      callsignCode: "AUTO001",
    });
    await ComCenPage.close();

    // validating banner
    expect(
      await homePage.validateThresholdShortageBannerText(
        "Officer (4) | Operational Member (10)"
      )
    ).toBeTruthy();

    // Creating incident
    [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    comcenDashboard = new ComCenDashboard(ComCenPage);
    await comcenDashboard.createIncident({
      callsignCode: "AUTO002",
      cadNumber: incidentInfo1.cadNumber,
    });
    await ComCenPage.close();
    // validating banner
    expect(
      await homePage.validateThresholdShortageBannerText(
        "Officer (4) | Operational Member (10) | Wearer (1)"
      )
    ).toBeTruthy();
  });

  test("TC 37405: Brigade admin should be able to notify other users via call by action", async () => {
    let incidentThresholdAUTO001;

    incidentThresholdAUTO001 = await thresholdPage.addNewIncidentThreshold({
      thresholdType: "Appliance",
      applianceType: "AUTO001",
      brigadeOperationalMemberCount: 0,
      brigadeOfficerMemberCount: 4,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Unavailable"],
      sendANotificationMessage: false,
      notificationRuleSendTo: ["All Members"],
      activateThreshold: true,
    });
    // Creating incident
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    let incidentInfo1 = await comcenDashboard.createIncident({
      callsignCode: "AUTO001",
    });
    await ComCenPage.close();
    // validating banner
    expect(
      await homePage.validateThresholdShortageBannerText("Officer (4)")
    ).toBeTruthy();
  });

  test("TC 37406: Brigade admin should be able to notify other users via text message", async () => {
    let incidentThresholdAUTO001;

    incidentThresholdAUTO001 = await thresholdPage.addNewIncidentThreshold({
      thresholdType: "Appliance",
      applianceType: "AUTO001",
      brigadeOperationalMemberCount: 0,
      brigadeOfficerMemberCount: 8,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Unavailable"],
      sendANotificationMessage: true,
      notificationRuleSendTo: ["All Members"],
      activateThreshold: true,
    });
    // Creating incident
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    let incidentInfo1 = await comcenDashboard.createIncident({
      callsignCode: "AUTO001",
    });
    await ComCenPage.close();
    // validating banner
    expect(
      await homePage.validateThresholdShortageBannerText("Officer (8)")
    ).toBeTruthy();

    await homePage.closeAllIncidentsInProgress();
  });

  test("TC 37421: User should be able send notification to those user with skills that meet the shortage when immediate break.", async () => {
    let incidentThresholdAUTO001;

    incidentThresholdAUTO001 = await thresholdPage.addNewIncidentThreshold({
      thresholdType: "Appliance",
      applianceType: "AUTO001",
      brigadeOperationalMemberCount: 10,
      brigadeOfficerMemberCount: 4,
      OnImmediateBreak: true,
      onlyContactPeopleWithSkill: true,
      peopleWithStatus: ["Standby"],
      sendANotificationMessage: true,
      notificationRuleSendTo: ["All Members"],
      activateThreshold: true,
    });
    // Creating incident
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    let incidentInfo1 = await comcenDashboard.createIncident({
      callsignCode: "AUTO001",
    });
    await ComCenPage.close();
    // validating banner
    expect(
      await homePage.validateThresholdShortageBannerText(
        "Officer (4) | Operational Member (10)"
      )
    ).toBeTruthy();

    await homePage.closeAllIncidentsInProgress();
  });

  test("TC 37422: User should be able send notification to those user with skills that meet the shortage when threshold is not meet within specific period of time", async () => {
    let incidentThresholdAUTO001;

    incidentThresholdAUTO001 = await thresholdPage.addNewIncidentThreshold({
      thresholdType: "Appliance",
      applianceType: "AUTO001",
      brigadeOperationalMemberCount: 10,
      brigadeOfficerMemberCount: 4,
      onlyContactPeopleWithSkill: true,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Standby"],
      sendANotificationMessage: true,
      notificationRuleSendTo: ["All Members"],
      activateThreshold: true,
    });
    // Creating incident
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    let incidentInfo1 = await comcenDashboard.createIncident({
      callsignCode: "AUTO001",
    });
    await ComCenPage.close();
    // validating banner
    expect(
      await homePage.validateThresholdShortageBannerText(
        "Officer (4) | Operational Member (10)"
      )
    ).toBeTruthy();

    await homePage.closeAllIncidentsInProgress();
  });

  test("TC 37428: when user click on 'Stop threshold' then no in app notification, message and call is send to to users", async () => {
    let incidentThresholdAUTO001;

    incidentThresholdAUTO001 = await thresholdPage.addNewIncidentThreshold({
      thresholdType: "Appliance",
      applianceType: "AUTO001",
      brigadeOperationalMemberCount: 10,
      brigadeOfficerMemberCount: 4,
      onlyContactPeopleWithSkill: false,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Standby"],
      sendANotificationMessage: true,
      notificationRuleSendTo: ["All Members"],
      activateThreshold: true,
    });
    // Creating incident
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    let incidentInfo1 = await comcenDashboard.createIncident({
      callsignCode: "AUTO001",
    });
    await ComCenPage.close();
    // validating banner
    expect(
      await homePage.validateThresholdShortageBannerText(
        "Officer (4) | Operational Member (10)"
      )
    ).toBeTruthy();

    // Stop Threshold
    await homePage.clickIncidentBell();
    await homePage.stopThresholdAndConfirm();
    // validate banner
    expect(await homePage.noCurrentThresholdShortageVisiblity).toBeTruthy();
    // Close incident
    await homePage.closeAllIncidentsInProgress();
  });

  test("TC 39573: User should be able to activate multiple incident threshold same time", async () => {
    let incidentThresholdAUTO001;
    let incidentThresholdAUTO002;

    incidentThresholdAUTO001 = await thresholdPage.addNewIncidentThreshold({
      thresholdType: "Appliance",
      applianceType: "AUTO001",
      brigadeOperationalMemberCount: 10,
      brigadeOfficerMemberCount: 4,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Unavailable"],
      sendANotificationMessage: true,
      notificationRuleSendTo: ["All Members"],
      activateThreshold: true,
    });

    incidentThresholdAUTO002 = await thresholdPage.addNewIncidentThreshold({
      thresholdType: "Appliance",
      applianceType: "AUTO002",
      wearerAttributeCount: 5,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Unavailable"],
      sendANotificationMessage: true,
      notificationRuleSendTo: ["All Members"],
      activateThreshold: true,
    });
  });

  test("TC 37410: When user select notification type call to action then 'Do not send to anyone who has already been notified during the current turnout' is not displayed", async () => {
    await thresholdPage.initiateCreateIncidentAndRule({
      thresholdType: "Appliance",
      applianceType: "AUTO001",
      sendANotificationMessage: false,
    });
    expect(
      await thresholdPage.isDoNotContactTurnoutCheckboxVisible()
    ).toBeFalsy();
    await navigationPage.goToHomeScreen();
  });

  test("TC 37411: When user select notification type Send a notification message then 'Do not send to anyone who has already been notified during the current turnout' is  displayed", async () => {
    await thresholdPage.initiateCreateIncidentAndRule({
      thresholdType: "Appliance",
      applianceType: "AUTO001",
      sendANotificationMessage: true,
    });
    expect(
      await thresholdPage.isDoNotContactTurnoutCheckboxVisible()
    ).toBeTruthy();
    await navigationPage.goToHomeScreen();
  });

  test("TC 48857: Create incident threshold for Cover move event", async () => {

    test.slow();
    // creating new appliance threshold
    incidentThresholdAUTO001 = await thresholdPage.addNewIncidentThreshold({
      thresholdType: "Appliance",
      applianceType: "AUTO001",
      brigadeOperationalMemberCount: 10,
      brigadeOfficerMemberCount: 4,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Available"],
      sendANotificationMessage: true,
      activateThreshold: true,
    });

    // creating new event threshold
    await thresholdPage.addNewEventThreshold({
      thresholdType: "Event",
      respondingAlliance: "AUTO001",
      eventType: "COVERMOVE",
      brigadeOperationalMemberCount: 10,
      thresholdTimeSecs: 30,
      peopleWithStatus: ["Unavailable"],
      activateThreshold: true,
      notificationRuleSendTo: ["All Members"],
      sendANotificationMessage: true,
    });

    // Creating incident
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    await comcenDashboard.createCoverMoveIncident({
      callsignCode: "AUTO001",
      station: "WELLINGTON CITY",
      commonEventIdentifier: "1213",
    });
    await ComCenPage.close();

    expect(
      await homePage.validateThresholdShortageBannerText(
        "Operational Member (10)"
      )
    ).toBeTruthy();

    // cleanup
    await thresholdPage.deleteAllIncidentThresholdsAndRules();
    await homePage.closeAllIncidentsInProgress();
  });
});
