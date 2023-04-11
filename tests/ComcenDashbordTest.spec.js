const { test, expect } = require("@playwright/test");
const { MessagePage } = require("../pages/MessagePage");
const { NavigationPage } = require("../pages/NavigationPage");
const { ComCenDashboard } = require("../pages/ComCenDashboard");
const { ThresholdPage } = require("../pages/ThresholdPage");
const { HomePage } = require("../pages/HomePage");
const { SettingsPage } = require("../pages/SettingsPage");
const { ContactPage } = require("../pages/ContactPage");
const { Utilitypage } = require("../utils/UtilityPage");
const users = require("../config/config.users.json");
const login = require("./helper/login");

test.describe("Comcen Response Dashboard", () => {
  let context;
  let page;
  let navigationPage;
  let thresholdPage;
  let homePage;
  let settingsPage;
  let contactPage;
  let messagePage;
  test.beforeAll(async ({ browser }) => {
    const browserObj = await login(browser);
    context = browserObj.context;
    page = browserObj.page;
    navigationPage = new NavigationPage(page);
    thresholdPage = new ThresholdPage(page);
    homePage = new HomePage(page);
    settingsPage = new SettingsPage(page);
    contactPage = new ContactPage(page);
    messagePage = new MessagePage(page);
  });

  test.beforeEach(async () => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
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

  test("TC 30516: Validate Comcen Dashboard incident the Event Type Code icon, CADNumber, EventTypeCode, IncidentNoteText, and first four digits of emergency services Zone identifier", async () => {
    // cleanup
    await thresholdPage.deleteAllIncidentThresholdsAndRules();
    await homePage.closeAllIncidentsInProgress();

    // Creating incidents
    let incidents = [];
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    let incidentAUTO001 = await comcenDashboard.createIncident({
      callsignCode: "AUTO001",
    });
    incidents.push(incidentAUTO001);
    // await ComCenPage.pause();
    await comcenDashboard.navigateToResponseDashboardOption();
    let incidentAUTO002 = await comcenDashboard.createIncident({
      callsignCode: "AUTO002",
    });
    // await ComCenPage.pause();
    incidents.push(incidentAUTO002);

    await comcenDashboard.navigateToResponseDashboardOption();
    let incidentAUTO003 = await comcenDashboard.createIncident({
      callsignCode: "AUTO003",
    });
    incidents.push(incidentAUTO003);

    await comcenDashboard.navigateToResponseDashboardOption();
    await comcenDashboard.searchandValidateIncidentResponse({
      search: "Automated Testflight",
      incidents,
    });

    await ComCenPage.close();
    // cleanup
    await homePage.closeAllIncidentsInProgress();
  });

  test("TC 30518: As a User with Incident dashboard access, I can see separated columns of the number of drivers, crew and Officers responding to each incident on Response Dashboard", async () => {
    // cleanup
    await thresholdPage.deleteAllIncidentThresholdsAndRules();
    await homePage.closeAllIncidentsInProgress();

    // creating incident
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    let incidentAUTO001 = await comcenDashboard.createIncident({
      callsignCode: "AUTO001",
    });

    // adding attribute
    await page.bringToFront();
    await settingsPage.addAttributesToBrigadeMember({
      member: "AMSAuto Test",
      attributes: ["Officer"],
    });

    //validating incident response
    await ComCenPage.bringToFront();
    await comcenDashboard.navigateToResponseDashboardOption();
    await comcenDashboard.searchandValidateIncidentResponse({
      search: "Automated Testflight",
      incident: incidentAUTO001,
    });

    // changing brigade status to respond
    await homePage.changeBrigadeStatusToResponding("AMSAuto Test");

    // validating if office count is changed to 1
    await ComCenPage.bringToFront();
    await page.waitForTimeout(2000);
    await comcenDashboard.searchandValidateIncidentResponse({
      search: "Automated Testflight",
      incident: incidentAUTO001,
      officer: 1,
    });
    await ComCenPage.close();

    // cleanup
    await page.bringToFront();
    await settingsPage.removeAttributesToBrigadeMember({
      member: "AMSAuto Test",
      attributes: ["Officer", "Class 1"],
    });
    // cleanup
    await navigationPage.goToHomeScreen();
    await homePage.closeAllIncidentsInProgress();
  });

  test("TC 30519 30522: As a user with the ComCen Dashboard role, when I type into the search box, the zone filters are not usable and are greyed out", async () => {
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    await comcenDashboard.clearSearch();
    await comcenDashboard.checkFiltersEnabled(true);
    await comcenDashboard.search("Automated Testflight");
    await comcenDashboard.checkFiltersEnabled(false);
    ComCenPage.close();
  });

  test("TC 30520: As a ComCen user, I can search (aria-autocomplete) for a specific brigade and select it", async () => {
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    await comcenDashboard.validateSearchAutoComplete({
      autoComplete: "Automated Testflight",
      search: "Automated",
    });
    ComCenPage.close();
  });

  test("TC 30507: As a User with ComCen Dashboard role, I can navigate to the Brigade Availability Dashboard and see All ‘active’ AMS brigades listed in alphabetical order", async () => {
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    await comcenDashboard.navigateToAvailabilityDashboard();
    await comcenDashboard.validBrigadeInAlphabeticalOrder();
    ComCenPage.close();
  });

  test("TC 30510: As a User with ComCen Dashboard role, I can see the selected/unselected dispatch zone(s) on the Brigade Availability Dashboard", async () => {
    const northcomBrigades = ["Auckland City", "Hamilton", "Mount Roskill"];
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    await comcenDashboard.navigateToAvailabilityDashboard();
    await comcenDashboard.selectFilters(); // by default all
    expect(
      await comcenDashboard.checkIfBrigadeListIncludes(northcomBrigades)
    ).toBeTruthy();
    //unselecting filters
    await comcenDashboard.unselectFilters(["Northcom"]);
    expect(
      await comcenDashboard.checkIfBrigadeListIncludes(northcomBrigades)
    ).toBeFalsy();
    //cleanup
    await comcenDashboard.selectFilters(); // by default all
    ComCenPage.close();
  });

  test("TC 30511: As a User with dashboard access, I can view the number of crew, drivers and officers that are either available or on standby for each brigade on Brigade Availability Dashboard", async () => {
    const env = process.env.NODE_ENV;
    const user = env === "uat" ? users.uat : users.stage;
    await navigationPage.goToContactScreen();
    const countFromContacts = await contactPage.getDriverCrewOfficerCount();
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    await comcenDashboard.navigateToAvailabilityDashboard();
    const countFromBrigadeDashboard =
      await comcenDashboard.getDriverCrewOfficerCount(user.admin.brigadeName);
    expect(countFromBrigadeDashboard, "Count match failure").toEqual(
      countFromContacts
    );
    ComCenPage.close();
  });

  test("TC 30512: As a User with dashboard access, I can see the numbers being refreshed on Brigade Availability Dashboard when brigade members change their status", async () => {
    /* NOTE: This test uses "AutoTest Flight 165" user as the user is configured to be an officer */
    const memInfo = Utilitypage.GetUser().admin;

    // Pre-requisite - Keep AutoTest Flight 165 available
    await navigationPage.goToContactScreen();
    await contactPage.changeStatusTo({
      member: "AutoTest Flight 165",
      status: "Available",
    });
    // getting the current count
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    await comcenDashboard.navigateToAvailabilityDashboard();
    const count = await comcenDashboard.getDriverCrewOfficerCount(
      memInfo.brigadeName
    );

    // changin the status - officer count will come down
    await page.bringToFront();
    await page.reload();
    await contactPage.changeStatusTo({
      member: "AutoTest Flight 165",
      status: "Unavailable",
    });

    // getting the updated count
    await ComCenPage.bringToFront();
    await ComCenPage.reload();
    const updatedCount = await comcenDashboard.getDriverCrewOfficerCount(
      memInfo.brigadeName
    );

    // Validating results
    expect(count, "Count match failure").not.toEqual(updatedCount);
    expect(count.driver, "Driver Count doesnt match").toEqual(
      updatedCount.driver
    );
    expect(count.crew, "Crew Count doesnt match").toEqual(updatedCount.crew);
    expect(count.officer, "Invalid Officer Count").toBeGreaterThan(
      updatedCount.officer
    );

    // cleanup
    await page.bringToFront();
    await page.reload();
    await contactPage.changeStatusTo({
      member: "AutoTest Flight 165",
      status: "Available",
    });

    // getting the updated count
    await ComCenPage.bringToFront();
    await ComCenPage.reload();
    const defaultCount = await comcenDashboard.getDriverCrewOfficerCount(
      memInfo.brigadeName
    );

    expect(count, "Count match failure").toEqual(defaultCount);
    ComCenPage.close();
  });

  test("TC 30513: As a User with dashboard access, I can see the correct brigade availability status based on the rules in the Availability Matrix", async () => {
    /* NOTE: This test will filter out all the members who are drivers and mark them as unavailable */
    const env = process.env.NODE_ENV;
    const user = env === "uat" ? users.uat : users.stage;

    // getting the current count and status
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);
    await comcenDashboard.navigateToAvailabilityDashboard();
    await comcenDashboard.selectFilters(); // by default all

    const currentCount = await comcenDashboard.getDriverCrewOfficerCount(
      user.admin.brigadeName
    );
    const currentAvailabilityStatus =
      await comcenDashboard.getBrigadeMemberAvailabilityStatus(
        user.admin.brigadeName
      );
    expect(
      currentAvailabilityStatus,
      "Fix test data, brigade is unavailable"
    ).toBeTruthy();

    // marking all drivers unavailable
    await page.bringToFront();
    await navigationPage.goToContactScreen();
    const driverState = await contactPage.markAllDriversUnavailable();
    await ComCenPage.bringToFront();
    const updatedCount = await comcenDashboard.getDriverCrewOfficerCount(
      user.admin.brigadeName
    );
    const updatedAvailabilityStatus =
      await comcenDashboard.getBrigadeMemberAvailabilityStatus(
        user.admin.brigadeName
      );
    expect(
      updatedAvailabilityStatus,
      "Brigade member is still available even when all the drivers are unavailable"
    ).toBeFalsy();
    expect(updatedCount.driver, "Invalid driver Count").toEqual(0);
    // Cleanup - code to mark all drivers unavailable and return the list so that they can be marked to their default status
    await page.bringToFront();
    await contactPage.markAllDriversStateTo(driverState);
    const count = await comcenDashboard.getDriverCrewOfficerCount(
      user.admin.brigadeName
    );
    const availabilityStatus =
      await comcenDashboard.getBrigadeMemberAvailabilityStatus(
        user.admin.brigadeName
      );
    expect(availabilityStatus, "Failed to reset test data").toBeTruthy();
    expect(currentCount, "Failed to reset test data").toEqual(count);
    ComCenPage.close();
  });

  test("TC 49889-A:  Comcen Dashboard | Availability Dashboard - User can filter by Pre Incident Status", async () => {
    test.slow();
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);

    //Validating Availablity Dashboard
    await comcenDashboard.navigateToAvailabilityDashboard();
    await comcenDashboard.selectFilters(); // by default all
    const allBrigades = await comcenDashboard.getBrigadesCount();
    console.log(allBrigades);
    expect
      .soft(allBrigades.total, "Brigade total count doesnt match")
      .toEqual(allBrigades.available + allBrigades.unavailable);
    await comcenDashboard.changeAvailableFilterStatus({
      available: false,
      unavailable: true,
    });

    const unAvailableBrigades = await comcenDashboard.getBrigadesCount();
    console.log(unAvailableBrigades);
    expect
      .soft(
        unAvailableBrigades.unavailable,
        "Unavailable Brigade count doesnt match"
      )
      .toEqual(allBrigades.unavailable);

    await comcenDashboard.changeAvailableFilterStatus({
      available: true,
      unavailable: false,
    });

    const availableBrigades = await comcenDashboard.getBrigadesCount();
    console.log(availableBrigades);
    expect
      .soft(availableBrigades.available, "Available Brigade count doesnt match")
      .toEqual(allBrigades.available);

    // Cleanup
    await comcenDashboard.changeAvailableFilterStatus({
      available: true,
      unavailable: false,
    });
    expect(test.info().errors).toHaveLength(0);
    ComCenPage.close();
  });

  test("TC 49889-B:  Comcen Dashboard | Response Dashboard - User can filter by Pre Incident Status", async () => {
    test.slow();
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);

    //Validating Availablity Dashboard
    await comcenDashboard.navigateToResponseDashboardOption();
    await comcenDashboard.selectFilters(); // by default all
    const allIncidents = await comcenDashboard.getIncidentsCount();
    console.log(allIncidents);
    expect
      .soft(allIncidents.total, "Brigade total count doesnt match")
      .toEqual(allIncidents.available + allIncidents.unavailable);
    await comcenDashboard.changeAvailableFilterStatus({
      available: false,
      unavailable: true,
    });

    const unAvailableIncidents = await comcenDashboard.getIncidentsCount();
    console.log(unAvailableIncidents);
    expect
      .soft(
        unAvailableIncidents.unavailable,
        "Unavailable incident count doesnt match"
      )
      .toBeGreaterThan(0);
    expect
      .soft(
        unAvailableIncidents.available,
        "Unavailable incident count doesnt match"
      )
      .toEqual(0);
    await comcenDashboard.changeAvailableFilterStatus({
      available: true,
      unavailable: false,
    });

    const availableIncidents = await comcenDashboard.getIncidentsCount();
    console.log(availableIncidents);
    expect
      .soft(
        availableIncidents.available,
        "Available Incident count doesnt match"
      )
      .toEqual(allIncidents.available);
    expect
      .soft(
        availableIncidents.unavailable,
        "Available Incident count doesnt match"
      )
      .toEqual(0);
    // Cleanup
    await comcenDashboard.changeAvailableFilterStatus({
      available: true,
      unavailable: false,
    });
    expect(test.info().errors).toHaveLength(0);
    ComCenPage.close();
  });

  test("TC 53555 53557 53558: The user with Comcen access should be to see a new tab under Comcen BCP, should be able to select brigade and shouldnt enter more than 120 characters in message field", async () => {
    /* NOTE: This test uses "AutoTest Flight 165" user as the user is configured to be an officer */
    const memInfo = Utilitypage.GetUser().admin;

    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);

    await comcenDashboard.navigateToBCPOption();

    // tc 53555
    await expect(
      await comcenDashboard.getCommsCentreMessagingTab(),
      "Comcent center messaging tab is not visible"
    ).toBeVisible();
    await expect(
      await comcenDashboard.getApplianceTab(),
      "Appliance tab is not visible"
    ).toBeVisible();
    await expect(
      await comcenDashboard.getCoverMoveTurnoutMessageTab(),
      "CoverMoveTurnoutMessage tab is not visible"
    ).toBeVisible();
    await expect(
      await comcenDashboard.getTurnoutMessageTab(),
      "Turnout message tab is not visible"
    ).toBeVisible();

    // tc 53557
    await comcenDashboard.clickCommsCentreMessagingTab();
    await comcenDashboard.fillAndSelectBrigadeInput(memInfo.brigadeName);

    // tc 53558
    await comcenDashboard.fillMessageTextAndValidateMaxLength(120);
    ComCenPage.close();
  });

  test("TC 53560: The user with Comcen access should not be able to click on Post without selecting brigade name and entering text message.", async () => {
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);

    await comcenDashboard.navigateToBCPOption();
    await comcenDashboard.clickCommsCentreMessagingTab();

    await comcenDashboard.assertEmptyFormSubmission_commsCentreMessaging();
    ComCenPage.close();
  });

  test("TC 55759: The user with Comcen access should not be able to click on Post on entering the wrong brigade name.", async () => {
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);

    await comcenDashboard.navigateToBCPOption();
    await comcenDashboard.clickCommsCentreMessagingTab();

    await comcenDashboard.assertInvalidBrigadeFormSubmission_commsCentreMessaging();
    ComCenPage.close();
  });

  test("TC 53559 54790: The user with Comcen access should be able to click on Post and the pager message should be sent to brigade members. Validate message on home messages tab and on message page.", async () => {
    const memInfo = Utilitypage.GetUser().admin;
    // pre-requisite - memeber should be operational member
    await settingsPage.addAttributesToBrigadeMember({
      member: memInfo.name,
      attributes: ["Operational Member"],
    });

    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);

    await comcenDashboard.navigateToBCPOption();
    await comcenDashboard.clickCommsCentreMessagingTab();
    const commsCentreMessage = {
      brigade: memInfo.brigadeName,
      messageText: "Message Text " + Math.floor(Math.random() * 1000),
    };
    // if no message object passed it will go with the default
    const messageSent =
      await comcenDashboard.fillAndPostCommsCentreMessagingForm(
        commsCentreMessage
      );
    ComCenPage.close();
    // validate message on home page
    await page.bringToFront();
    await navigationPage.goToHomeScreen();
    await homePage.validateLastMessage({
      from: "COMCEN",
      message: messageSent.message,
      brigade: messageSent.brigadeMember,
    });

    await navigationPage.goToMessageScreen();
    await messagePage.validateLastMessage({
      from: "COMCEN",
      message: messageSent.message,
      brigade: messageSent.brigadeMember,
    });
  });

  test("TC 55135: User should be able to filter the sent messages according to Comcen(s).", async () => {
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);

    await comcenDashboard.navigateToExecutiveMessages();
    await comcenDashboard.selectFilters(); // by default all
    let totalCount = await comcenDashboard.getExecutiveMessagesCount();
    console.log(totalCount);

    //unselecting filters
    await comcenDashboard.unselectFilters(["Northcom"]);
    const withoutNorthcom = await comcenDashboard.getExecutiveMessagesCount();
    expect(await withoutNorthcom).toBeLessThanOrEqual(totalCount);

    await comcenDashboard.selectFilters(["Northcom"]);
    await comcenDashboard.unselectFilters(["Centralcom"]);
    const withoutCetralcom = await comcenDashboard.getExecutiveMessagesCount();
    expect(await withoutCetralcom).toBeLessThanOrEqual(totalCount);

    await comcenDashboard.selectFilters(["Centralcom"]);
    await comcenDashboard.unselectFilters(["Southcom"]);
    const withoutSouthcom = await comcenDashboard.getExecutiveMessagesCount();
    expect(await withoutSouthcom).toBeLessThanOrEqual(totalCount);

    await comcenDashboard.selectFilters(["Southcom"]);

    ComCenPage.close();
  });

  test("TC 55136: User should be able to view the newest messages at the top.", async () => {
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);

    await comcenDashboard.navigateToExecutiveMessages();
    await comcenDashboard.selectFilters(); // by default all
    await comcenDashboard.validateDateTimeList();
  });

  test("TC 55137: The older messages should get loaded via lazy loading.", async () => {
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);

    await comcenDashboard.navigateToExecutiveMessages();
    await comcenDashboard.selectFilters(); // by default all
    const totalCount = await comcenDashboard.getExecutiveMessagesCount();
    await comcenDashboard.scrollExecutiveMessages();
    const newTotalCount = await comcenDashboard.getExecutiveMessagesCount();
    expect(await totalCount, "Lazy load failure").toBeLessThan(newTotalCount);
  });

  test("TC 55138: The user should be able to see the columns: 'Callsign', 'Sent DateTime', 'Message', 'Response', 'ResponseTime'", async () => {
    let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
    let comcenDashboard = new ComCenDashboard(ComCenPage);

    await comcenDashboard.navigateToExecutiveMessages();
    await comcenDashboard.validateExecutiveMessageHeader();
  });

    test("TC 55124: The comcen user should be able to view the messages with different statuses.", async () => {
      let [ComCenPage] = await navigationPage.goToComCenDashboardScreen();
      let comcenDashboard = new ComCenDashboard(ComCenPage);

      await comcenDashboard.navigateToExecutiveMessages();
      await comcenDashboard.scrollExecutiveMessages();
      await comcenDashboard.validateExecutiveMessageStatus();
    });

});
