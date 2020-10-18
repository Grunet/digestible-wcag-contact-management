require("dotenv").config({
  path: require("find-config")(".env", { cwd: __dirname }),
});

const { getSubscribers } = require("../../../dist/index.js");

(async function () {
  const inputs = {
    mailchimp: {
      apiKey: process.env.MANUAL_MAILCHIMP_API_KEY,
      listId: process.env.MANUAL_MAILCHIMP_LIST_ID,
    },
  };

  const res = await getSubscribers(inputs);

  console.log("\n");
  console.log(getSubscribers.name);
  console.log(res);
})();
