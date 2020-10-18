require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
});

const { getSubscribers } = require("../../../dist/index.js");

(async function () {
  const inputs = {
    mailchimp: {
      apiKey: process.env.MAILCHIMP_API_KEY,
      listId: process.env.MAILCHIMP_LIST_ID,
    },
  };

  const res = await getSubscribers(inputs);

  console.log("\n");
  console.log(getSubscribers.name);
  console.log(res);
})();
