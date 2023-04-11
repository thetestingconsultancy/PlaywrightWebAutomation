# Introduction 
TODO: Give a short introduction of your project. Let this section explain the objectives or the motivation behind this project. 

# Getting Started
1.	Installation process
2.	Software dependencies
### Instal dependencies
```
npm install
```
>> Note: In windows, delete the node module directory first

3.	Latest releases
4.	API references

## Make you Code look Pretty 
>> Install extension - Prettier - code formatter

>> Go to settings -> Formatting -> select format on save and format on copy -> select Prettier code formater 

# Build and Test

### Execute all test in uat environemnt
```
npm run test:uat
npm run test:stage

```
### Execute Particular Spec file
```
npm run test:uat MessageTest
npm run test:stage SettingsTest
```
### Execute test(s) with title
```
npm run test:stage-grep "Archive and unarchive new message"
npm run test:uat-grep "Archive and unarchive new message"
```
### To view report after execution
```
npm run show-report
```
### Tag test
```
test('Test login page @smoke', async ({ page }) => {
  // ...
});
test('Test login page @regression', async ({ page }) => {
  // ...
});
```
```
npm run test:stage-grep @smoke
npm run test:uat-grep @smoke
```
# Contribute
### How to add new test cases to main
* Pull main branch
```
git checkout main ( if not already on main)
git pull ( to get latest code)
``` 
* Create your own branch
```
git checkout -b feature/<feature_name> -> to work on new test cases
e.g. git checkout -b feature/incidents_tests

or

git checkout -b fix/<test_fix> -> to fix failing test case
e.g. git checkout -b fix/incident_failed_fix
```
* Make changes to your branch and commit
```
git add .  -> to stage all changes
git commit -m "change you made or feature you added message"
```
* Push your changes to git remote
```
git push --set-upstream origin <branch-name>    -> for the first time else do `git push`
e.g. git push --set-upstream origin feature/incidents_tests
```
* Create pull request to merge your changes to main branch
> Go to [Repo pull request](https://nzfire.visualstudio.com/AMS%20Build/_git/AMSWebAutomation/pullrequests?_a=mine)

> Select your branch displayed on top and click pull request

> Assign it to Ashish or Udit to review

If you want to learn more about creating good readme files then refer the following [guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:
- [ASP.NET Core](https://github.com/aspnet/Home)
- [Visual Studio Code](https://github.com/Microsoft/vscode)
- [Chakra Core](https://github.com/Microsoft/ChakraCore)