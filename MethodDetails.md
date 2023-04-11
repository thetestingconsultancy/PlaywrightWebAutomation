# Method/Function Definitions 
> This page contains details about the methods/functions created in page.js file
----
## Settings Page
#### MethodName: *_changeNotification* and *_changeNotificationAndSave*
##### Type: Local method - shouldnt be called directly from Test file
##### Definitions: 
```
  this method takes an Object of two values - category and typeAndStatus

  category values as a string:
  "threshold" for Brigade Threshold Notifications
  "message" for Message Notifications
  
  typeAndStatus value as an object: 
  type: InApp, TextMessage, MobilePhone, LandLine, AlternativeContact
  status: "true" to check checbox and "false" to uncheck

  example: 
  typeAndStatus: {type: "TextMessage", status: "true"}
  _changeNotification({category: "threshold", typeAndStatus})

  _changeNotificationAndSave will perform as above but will save the form 
```
----
----
#### MethodName: *_validateNotification*
##### Type: Local method - shouldnt be called directly from Test file
##### Definitions: 
```
  this method takes an Object of three values - category, typeAndStatus and isDiabled

  isDiabled is an optional value, to check is checkbox is disabled or not. if it not passed then it will check if checkbox is enabled or not

  category values as a string:
  "threshold" for Brigade Threshold Notifications
  "message" for Message Notifications
  
  typeAndStatus value as an object: 
  type: InApp, TextMessage, MobilePhone, LandLine, AlternativeContact
  status: true or false  - assert if checkbox sould be checked or unchecked 

  example: 
  typeAndStatus: {type: "TextMessage", status: "true"}
  _validateNotification({category: "threshold", typeAndStatus})
```
----
