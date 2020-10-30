const MailChimp = "MailChimp";

const supportedClients = {
  [MailChimp]: MailChimp,
};

function createContactsClient(clientId, defaultSettings) {
  if (!supportedClients.hasOwnProperty(clientId)) {
    throw new Error(
      `Unrecognized client id passed to factory: ${clientId.toString()}`
    );
  }

  switch (clientId) {
    case MailChimp:
      if (!defaultSettings.hasOwnProperty("apiKey")) {
        throw new Error(
          "Required API key is missing from the passed MailChimp default settings"
        );
      }

      return new MailChimpAdapter(defaultSettings);
    default:
      throw new Error(`${clientId}'s adapter has not been implemented yet`);
  }
}

class MailChimpAdapter {
  constructor(defaults) {
    const Mailchimp = require("mailchimp-api-v3");
    this.__mailchimp = new Mailchimp(defaults["apiKey"]);

    this.__defaultSettings = { ...defaults }; //Shallow copy
  }

  async getContactsData(inputs) {
    const inputsWithDefaults = Object.assign(
      { ...this.__defaultSettings },
      inputs
    ); //Shallow copy

    const {
      locatorIds: { listId },
    } = inputsWithDefaults;

    const rawContactsData = await this.__mailchimp.batch({
      method: "get",
      path: `/lists/${listId}/members`,
    });

    const adaptedContactsData = this.__adaptRawContactsData(rawContactsData);

    return adaptedContactsData;
  }

  __adaptRawContactsData(rawContactsData) {
    //If the calls aren't batched, the response is a single object (that isn't wrapped in an array)
    const rawContactsDataBatches = Array.isArray(rawContactsData)
      ? rawContactsData
      : [rawContactsData];

    const allMembers = rawContactsDataBatches
      .map(({ members }) => members)
      .reduce((accumulatedMembers, members) => {
        return accumulatedMembers.concat(members);
      });

    const adaptedContactsData = allMembers.map(({ email_address, status }) => {
      return {
        email_address: email_address,
        isSubscribed: status === "subscribed",
      };
    });

    return adaptedContactsData;
  }
}

module.exports = {
  Clients: supportedClients,
  createContactsClient: createContactsClient,
};
