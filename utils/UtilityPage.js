const users = require("../config/config.users.json");

class Utilitypage {
  constructor(page) {
    this.page = page;
  }

  GetRandomPhoneNumberSuffix() {
    const randomNum = (min, max) =>
      Math.floor(Math.random() * (max - min)) + min;
    var Num = randomNum(1000, 9000);
    return Num;
  }

  GetRandomAlphaString(numChar) {
    var strValues = "abcdefghijklmnopqrstuvwxyz";
    var strVal = "";
    var strTmp;
    for (var i = 0; i < numChar; i++) {
      strTmp = strValues.charAt(Math.round(strValues.length * Math.random()));
      strVal = strVal + strTmp;
    }
    return strVal;
  }

  static GetUser() {
    const env = process.env.NODE_ENV;
    const user = env === "uat" ? users.uat : users.stage;
    return user;
  }
}

module.exports = { Utilitypage };
