const { getSubscribers } = require("../../../dist/index.js");

const testApiKey = process.env.AUTOMATED_MAILCHIMP_API_KEY;

let mailchimpClient;
let testListId;

beforeAll(async () => {
  const Mailchimp = require("mailchimp-api-v3");
  mailchimpClient = new Mailchimp(testApiKey);

  try {
    await __deleteAllLists(mailchimpClient); //In case a previous run didn't finish cleaning up correctly

    const { listId } = await __addList(mailchimpClient);
    testListId = listId;
  } catch (error) {
    //Workaround for jest bug - https://github.com/facebook/jest/issues/8688
    console.error(error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await __deleteAllLists(mailchimpClient);
  } catch (error) {
    //Workaround for jest bug - https://github.com/facebook/jest/issues/8688
    console.error(error);
    throw error;
  }
});

describe("getSubscribers", () => {
  const DEFAULT_NUM_CONTACTS = 10;

  let mailchimpMembersData;

  beforeEach(async () => {
    ({ subscriberData: mailchimpMembersData } = await __addSubscribers(
      mailchimpClient,
      testListId,
      DEFAULT_NUM_CONTACTS
    ));
  });

  afterEach(async () => {
    await __deleteAllMembers(
      mailchimpClient,
      testListId,
      mailchimpMembersData.map(({ id }) => id)
    );
  });

  test("Only finds subscribers, not all contacts", async () => {
    //ARRANGE
    const someMemberId = mailchimpMembersData[0].id;
    await __unsubscribeMember(mailchimpClient, testListId, someMemberId);

    //ACT
    const res = await getSubscribers({
      mailchimp: {
        apiKey: testApiKey,
        listId: testListId,
      },
    });

    //ASSERT
    const expectedNumberOfSubscribers = DEFAULT_NUM_CONTACTS - 1;

    expect(Array.from(res.subscribers)).toEqual(
      Array.from({ length: expectedNumberOfSubscribers }).map(() => ({
        email: expect.anything(),
      }))
    );
  });
});

async function __deleteAllLists(mailchimpClient) {
  const { lists } = await mailchimpClient.get({
    path: "/lists/",
  });

  if (!lists || lists.length <= 0) {
    return;
  }

  const deleteCalls = lists.map(({ id }) => ({
    method: "delete",
    path: `/lists/${id}`,
  }));

  await mailchimpClient.batch(deleteCalls);
}

async function __addList(mailchimpClient) {
  const addRes = await mailchimpClient.request({
    method: "post",
    path: "/lists/",
    body: {
      name: "dummy",
      contact: {
        company: "dummy",
        address1: "dummy",
        city: "dummy",
        state: "dummy",
        zip: "dummy",
        country: "US",
      },
      permission_reminder: "dummy",
      campaign_defaults: {
        from_name: "dummy",
        from_email: "dummy@dummy.com",
        subject: "dummy",
        language: "dummy",
      },
      email_type_option: false,
    },
  });

  const { id } = addRes;

  return {
    listId: id,
  };
}

async function __addSubscribers(mailchimpClient, listId, numToAdd) {
  /**Need to use something that looks real or Mailchimp won't add it
   *Need to use something unique each time or Mailchimp (eventually) won't add it
   *(Also the same email can't be re-added to the same list after it's been deleted)
   */
  const mockSubscribers = [...Array(numToAdd).keys()]
    .map((v) => `schramloewner${v}-${Date.now()}@gmail.com`)
    .map((emailAddress) => ({
      email_address: emailAddress,
      status: "subscribed",
    }));

  const { new_members, errors } = await mailchimpClient.request({
    method: "post",
    path: `/lists/${listId}`,
    body: {
      members: mockSubscribers,
    },
  }); //BEWARE - this request can return a 200 response even after failing to add contacts (but seems to populate the "errors" array when that happens)

  if (errors?.length > 0) {
    console.error(errors);
    throw new Error("Failed to add subscribers to the list");
  }

  const trimmed_new_members = new_members.map(({ id }) => ({
    id: id,
  }));

  return {
    subscriberData: trimmed_new_members,
  };
}

async function __unsubscribeMember(mailchimpClient, listId, memberId) {
  await mailchimpClient.request({
    method: "put",
    path: `/lists/${listId}/members/${memberId}`,
    body: {
      status: "unsubscribed",
    },
  });
}

async function __deleteAllMembers(mailchimpClient, listId, memberIds) {
  const deleteCalls = memberIds.map((id) => ({
    method: "post",
    path: `/lists/${listId}/members/${id}/actions/delete-permanent`,
  }));

  await mailchimpClient.batch(deleteCalls);
}
