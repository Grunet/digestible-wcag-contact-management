const {
  getSubscribers: getSubscribersFromMailchimp,
} = require("../src/index.js");
const {
  getSubscribers: getSubscribersFromAWS,
} = require("../src/getSubscribers.js");

async function getSubscribers(inputs) {
  if (inputs?.hasOwnProperty("mailchimp")) {
    return await getSubscribersFromMailchimp(inputs);
  }

  return await getSubscribersFromAWS();
}

module.exports = {
  getSubscribers: getSubscribers,
};
