class LoginPage {

    constructor(page) {
        this.page = page;
        this.usereNameField = page.locator("");
        this.passwordField = page.locator("");
        this.signInButton = page.locator("");
    }


    async goTo() {
        await this.page.goto("https://as-ams-core-api-s01.azurewebsites.net/#");
    }

    async validLogin(username, password) {
        await this.usereNameField.fill("");
        await this.passwordField.type("");
        await this.signInButton.click();
    }


}

module.exports = {LoginPage};