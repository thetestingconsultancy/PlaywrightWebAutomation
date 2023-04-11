const { test, expect } = require("@playwright/test");
const { USER_CONSTANTS } = require("../config/constant");
const { Utilitypage } = require('../utils/UtilityPage');
const { NavigationPage } = require('../pages/NavigationPage');

var groupName;
var memberName;
class GroupsPage {

    constructor(page) {
        this.page = page;
        this.newGroupButton = page.locator("//p[normalize-space()='New Group']");
        this.createNewGroupPopupWindow = page.locator("//h3[normalize-space()='Create New Group']");
        this.dynamicGroupRadioButton = page.locator("//label[normalize-space()='Dynamic Group']");
        this.staticGroupRadioButton = page.locator("//label[normalize-space()='Static Group']");
        this.nextButton = page.locator("//button[normalize-space()='Next']");
        this.groupNameTextbox = page.locator("//input[@id='name']");

        //Brigade Attribute Checkboxes locators
        this.operationalMemberCheckbox = page.locator("//label[normalize-space()='Operational Member']");
        this.createButton = page.locator("//button[normalize-space()='Create']");
        this.newGroupFirstMember = page.locator("(//div[@class='user info'])[1]//h4");
        this.editGroupButton = page.locator("//button[normalize-space()='Edit Group']");
        this.deleteGroupButton = page.locator("//button[normalize-space()='Delete Group']");
        this.deleteGroupPopupConfirmationWindow = page.locator("//p[normalize-space()='Are you sure you want to delete this group?']");
        this.deleteButton = page.locator("//button[normalize-space()='Delete']");

        this.brigadeMembers = page.locator("//h3[text()='Brigade Members']");

        // Static group locators
        this.addMemberButton = page.locator("//button[normalize-space()='Add Member']");
        this.addMemberSearchTextbox = page.locator("//input[@id='membersearch']");
        this.addButton = page.locator("//button[normalize-space()='Add']");
        this.memberInStaticGroup = page.locator("//div[@class='member card external']/div/div/h4");
    }

    getGroupName(name) {
        return this.page.locator("//h5[contains(text(),'" + name + "')]");
    }

    getActiveMemberName(name) {
        return this.page.locator("//div[@class='member card']/div/div/h4[contains(text(),'" + name + "')]");
    }

    activeMemberEditButton(name) {
        return this.page.locator("//div[@class='member card']/div/div/h4[contains(text(),'" + name + "')]/following::button[1]");
    }

    getStaticMemberCheckbox(name) {
        return this.page.locator("//li/h4[contains(text(),'" + name + "')]/following-sibling::div");
    }

    async createAndDeleteDynamicGroup() {
        const utilityPage = new Utilitypage();
        const nav = new NavigationPage(this.page);
        groupName = "TestGroup" + utilityPage.GetRandomPhoneNumberSuffix();
        console.log("This is group name ---> " + groupName);

        await this.newGroupButton.click();
        await expect(this.createNewGroupPopupWindow, 'Create new group popup is not displaying').toBeVisible();
        await this.dynamicGroupRadioButton.click();
        await this.nextButton.click();

        await this.groupNameTextbox.type(groupName, { delay: 30 });
        await this.operationalMemberCheckbox.click();
        await this.createButton.click();

        const firstMemberName = await this.newGroupFirstMember.textContent();
        memberName = firstMemberName.substring(0, firstMemberName.lastIndexOf('('));
        console.log("First member in newly created group is ---> " + memberName);

        nav.goToSettingScreen();
        await this.brigadeMembers.click();
        await this.page.waitForTimeout(3000);
        await this.getActiveMemberName(memberName).scrollIntoViewIfNeeded({ timeout: 5000 });
        await expect(this.getActiveMemberName(memberName), 'Member is not visible in active members list').toBeVisible();

        await this.activeMemberEditButton(memberName).click();
        await this.page.waitForTimeout(3000);
        await this.operationalMemberCheckbox.scrollIntoViewIfNeeded({ timeout: 5000 });

        const bool = await this.page.isChecked("//label[normalize-space()='Operational Member']");
        console.log("Checking checkbox whether member attribute is checked ---> " + bool);
        expect(await this.page.isChecked("//label[normalize-space()='Operational Member']")).toBeTruthy();

        nav.goToGroupsScreen();

        await this.getGroupName(groupName).click();
        await this.page.waitForTimeout(2000);
        await this.editGroupButton.click();
        await this.deleteGroupButton.click();
        await expect(this.deleteGroupPopupConfirmationWindow, 'Delete this group popup window is not displaying').toBeVisible();
        await this.deleteButton.click();
        console.log("Newly created group is deleted ---> " + groupName);
        await this.page.waitForTimeout(2000);
        await expect(this.getGroupName(groupName), "Group is not deleted").toBeHidden();
    }

    async createAndDeleteStaticGroup() {
        const utilityPage = new Utilitypage();
        groupName = "TestStaticGroup" + utilityPage.GetRandomPhoneNumberSuffix();
        console.log("This is group name ---> " + groupName);
        await this.newGroupButton.click();
        await expect(this.createNewGroupPopupWindow, 'Create new group popup is not displaying').toBeVisible();
        await this.staticGroupRadioButton.click();
        await this.nextButton.click();
        await this.groupNameTextbox.type(groupName, { delay: 30 });

        await this.addMemberButton.click();

        await this.addMemberSearchTextbox.type(USER_CONSTANTS.MEMBER_TO_ADD_IN_STATIC_GROUP, { delay: 20 });
        await this.getStaticMemberCheckbox(USER_CONSTANTS.MEMBER_TO_ADD_IN_STATIC_GROUP).click();
        await this.addButton.click();
        await this.page.waitForTimeout(2000);
        await this.createButton.click();
        await this.page.waitForTimeout(2000);
        await expect(this.getGroupName(groupName), 'Static group is not displaying').toBeVisible();
        // delete static group

        await this.editGroupButton.click();
        await this.deleteGroupButton.click();
        await expect(this.deleteGroupPopupConfirmationWindow, 'Delete this group popup window is not displaying').toBeVisible();
        await this.deleteButton.click();
        console.log("Newly created static group is deleted ---> " + groupName);
        await this.page.waitForTimeout(2000);
        await expect(this.getGroupName(groupName), "Group is not deleted").toBeHidden();

    }
}

module.exports = { GroupsPage };