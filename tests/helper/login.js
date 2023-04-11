const users = require("../../config/config.users.json");

module.exports = async (browser) => {
  let page;
  let context;
  context = await browser.newContext();
  page = await context.newPage();
  const env = process.env.NODE_ENV;
  const user = env === "uat" ? users.uat : users.stage;
  const username = user.admin.username;
  const password = user.admin.password;

  const loginInput = await page.locator("//*[@name='loginfmt']");
  const passwordInput = await page.locator(
    "//*[@name='passwd' and contains(@class,'form-control')]"
  );

  try {
    await page.goto("/");
    await loginInput.waitFor({ state: "visible", timeout: 10000 });
  } catch (e) {
    // to restart if the white screen occurs
    console.log(page.url());
    await page.reload({ timeout: 30000 });
    console.log(page.url());
    await page.goto("/", { timeout: 20000 });
    console.log(page.url());
    await loginInput.waitFor({ state: "visible", timeout: 30000 });
  }
  await loginInput.type(username, { delay: 30 });
  await page.keyboard.down("Enter");

  await passwordInput.waitFor({ state: "visible", timeout: 10000 });
  await passwordInput.type(password, { delay: 30 });
  await page.keyboard.down("Enter");

  await page.waitForTimeout(3000);

  return { page, context };
};
