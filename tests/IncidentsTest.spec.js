const { test, expect } = require("@playwright/test");
// // shift + option + F pretty format
const { SettingsPage } = require("../pages/SettingsPage");
const { NavigationPage } = require("../pages/NavigationPage");
const login = require("./helper/login");
const { HomePage } = require("../pages/HomePage");
const { ComCenDashboard } = require("../pages/ComCenDashboard");
const { StationDisplayPage } = require("../pages/StationDisplayPage");

test.describe("Incidents Test", () => {
  let context;
  let page;
  let settingsPage;
  let navigationPage;
  let homePage;
  let comcenDashboard;
  let stationDisplayPage;
  test.beforeAll(async ({ browser }) => {
    const browserObj = await login(browser);
    context = browserObj.context;
    page = browserObj.page;
    settingsPage = new SettingsPage(page);
    navigationPage = new NavigationPage(page);
    homePage = new HomePage(page);
    stationDisplayPage = new StationDisplayPage(page);
  });

  test.beforeEach(async () => {
    // await page.goto("/");
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

  test("TC 25372: Home - Desktop - List of recent incidents", async () => {
    await homePage.getRecentIncidentsHeader();
    const count1 = await homePage.getRecentIncidentsListTotalCount();
    await homePage.scrollRecentIncidents();
    const count2 = await homePage.getRecentIncidentsListTotalCount();
    expect(count2).toBeGreaterThan(count1);
    await homePage.scrollRecentIncidents();
    const count3 = await homePage.getRecentIncidentsListTotalCount();
    expect(count3).toBeGreaterThan(count2);
    const isDecending = await homePage.isRecentListInDecendingOrder();
    expect(isDecending).toEqual(true);
  });

  test("TC 25378: Home - Station Display - List of recent incidents", async () => {
    await homePage.closeAllIncidentsInProgress();
    await navigationPage.goToSettingScreen();
    // adding device and getting device name and pin
    const { deviceName, devicePin, deviceSecret } =
      await settingsPage.activateDevice();
    // navigating to station display page
    await page.goto("/stationdisplay");
    // activating device
    await stationDisplayPage.activateDevice(devicePin, deviceSecret);
    // validating lazy load
    const count1 = await stationDisplayPage.getRecentIncidentsListTotalCount();
    await stationDisplayPage.scrollRecentIncidents();
    const count2 = await stationDisplayPage.getRecentIncidentsListTotalCount();
    expect(count2).toBeGreaterThan(count1);
    const count3 = await stationDisplayPage.getRecentIncidentsListTotalCount();
    await stationDisplayPage.scrollRecentIncidents();
    const count4 = await stationDisplayPage.getRecentIncidentsListTotalCount();
    expect(count4).toBeGreaterThan(count3);
    const isDecending = await stationDisplayPage.isRecentListInDecendingOrder();
    expect(isDecending).toEqual(true);
    // remove device
    await page.goto("/settings");
    await settingsPage.deactivateAndDeleteDevice({
      deviceName,
      isDeviceActivated: true,
    });
  });

  test("TC 25368: Home - Desktop - Banner - Incident indicator", async () => {
    await page.goto("/");
    await homePage.getRecentIncidentsHeader().isVisible;
    const [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    comcenDashboard = new ComCenDashboard(ComCenPage);
    const incident = await comcenDashboard.createIncident();
    await ComCenPage.close();
    await homePage.checkIncidentAndCloseInProgress(incident);
  });

  test("TC 51210 54143: Brigade admin should not be able to view the checkbox under the brigade settings and should be able to see Respond direct to incident has been enabled for this brigade", async () => {
    await navigationPage.goToSettingScreen();
    expect(
      await settingsPage.validateTextVisibility("Respond direct to incident")
    ).toBeFalsy();
    expect(
      await settingsPage.validateTextVisibility(
        "Respond Direct To Incident has been enabled for this brigade"
      )
    ).toBeTruthy();
  });

  test("TC 53599 54149 54150: Desktop: User's status color, icon should be sky blue if the user is responding direct to incident. Appliances should be disabled for that user.", async () => {
    await homePage.closeAllIncidentsInProgress();

    // Creating incident
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    let incidentInfo1 = await comcenDashboard.createIncident({
      callsignCode: "AUTO001",
    });

    await page.bringToFront();
    await homePage.respondDirectToIncident({
      incident: incidentInfo1,
      brigadeRespondingDirect: "AutoTest Flight 165",
      brigadeResponding: "Matthew Batten",
    });
  });

  test("Userstory 55680-A: Black Watch - Brigade admin should not be able to view the checkbox under the brigade settings and should be able to see Black Watch has been enabled for this brigade", async () => {
    await homePage.selectBrigadeFromDropdown("Automated Blackwatch");
    await navigationPage.goToSettingScreen();
    expect(
      await settingsPage.validateTextVisibility(
        "Black Watch has been enabled for this brigade"
      )
    ).toBeTruthy();
    expect(
      await settingsPage.validateTextVisibility(
        "Respond Direct To Incident has been enabled for this brigade"
      )
    ).toBeTruthy();
  });

  test("Userstory 55680-B: Black Watch - Desktop: User's status color, icon should be green if the user is responding direct to incident. ", async () => {
    await homePage.selectBrigadeFromDropdown("Automated Blackwatch");
    await homePage.closeAllIncidentsInProgress();
    // Creating incident
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    let incidentInfo1 = await comcenDashboard.createIncident({
      callsignCode: "Autotest001",
    });
    await page.bringToFront();
    await homePage.respondDirectToIncident({
      incident: incidentInfo1,
      brigadeRespondingDirect: "AMSAuto Test",
      isBlackWatchEnabled: true,
    });
    await homePage.closeAllIncidentsInProgress();
  });
});
