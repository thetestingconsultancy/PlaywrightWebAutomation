const USER_CONSTANTS = {
  BRIGADE_TO_ACTIVATE_EMPLOYEE_ID: "180",
  BRIGADE_TO_ACTIVATE_EMPLOYEE_NAME: "AutoTest Flight 180",
  BRIGADE_TO_DEACTIVATE: "AutoTest Flight 200",
  MEMBER_TO_ADD_IN_STATIC_GROUP: "AutoTest Flight 164",
  BRIGADE_TO_ACTIVATE_DEVICE: "AutoTest Flight 165",
  BRIGADE_STATUS_CHANGE: "AutoTest Flight 195(CFO)",
};

const OFFICER_ATTRIBUTES = [
  "Officer Qualified",
  "Officer",
  "Crew Leader",
  "Fire Officer",
  "Op Support Officer",
];

const EXECUTIVE_MESSAGE_STATUSES = [
  "None",
  "Dismissed With No Action",
  "Attach Me",
  "Acknowledged",
  "Contacted COMCEN",
];

const CREW_ATTRIBUTES = ["Operational Member"];
const DRIVER_ATTRIBUTES = ["Class 2"];

const ERRORS = {
  EMPTY_BRIGADE_FIELD: "The Brigade field is required",
  EMPTY_MESSAGE_TEXT: "The Message Text field is required",
};

module.exports = {
  USER_CONSTANTS,
  OFFICER_ATTRIBUTES,
  CREW_ATTRIBUTES,
  DRIVER_ATTRIBUTES,
  ERRORS,
  EXECUTIVE_MESSAGE_STATUSES,
};
