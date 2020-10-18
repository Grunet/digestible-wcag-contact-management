const {
  getSubscribers: __getSubscribers,
} = require("./subscriberRetrieval.js");

async function getSubscribers(inputs) {
  return await __getSubscribers(inputs);
}

module.exports = {
  getSubscribers: getSubscribers,
};
