const { createContactsClient, Clients } = require("./contactsClientFactory.js");

async function getSubscribers(inputs) {
  const {
    mailchimp: { apiKey, listId },
  } = inputs;

  const mailchimpClient = createContactsClient(Clients.MailChimp, {
    apiKey: apiKey,
  });

  const contactsData = await mailchimpClient.getContactsData({
    locatorIds: { listId: listId },
  });

  const subscribedContactsData = contactsData.filter(
    ({ isSubscribed }) => isSubscribed
  );

  const thinnedSubscribersData = subscribedContactsData.map(
    ({ email_address }) => {
      return {
        email: email_address,
      };
    }
  );

  return {
    subscribers: new Set(thinnedSubscribersData),
  };
}

module.exports = {
  getSubscribers: getSubscribers,
};
