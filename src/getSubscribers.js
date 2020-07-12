const S3 = require("aws-sdk/clients/s3");

async function getSubscribers() {
  const s3 = new S3();
  try {
    const res = await s3
      .getObject({
        Bucket: "digestible-wcag-subscribers",
        Key: "subscribers.json",
      })
      .promise();

    const json = res?.Body?.toString();
    if (!json) {
      throw new Error("Response from AWS get request to S3 bucket was empty");
    }

    const jsObj = JSON.parse(json);
    const listOfSubscribers = jsObj["subscribers"];

    return new Set(listOfSubscribers);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getSubscribers: getSubscribers,
};
