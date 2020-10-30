const {
  getSubscribers: __getSubscribers,
} = require("./subscriberRetrieval.js");

const decoratedFunctions = {
  __getSubscribers: wrapInTimingDecorator(__getSubscribers),
};

async function getSubscribers(inputs) {
  return await decoratedFunctions.__getSubscribers(inputs);
}

function wrapInTimingDecorator(someAsyncFunc) {
  return async function () {
    const t0 = Date.now();

    const res = await someAsyncFunc(...arguments);

    const t1 = Date.now();
    console.log(`${someAsyncFunc.name} execution time: ${(t1 - t0) / 1000} s`);

    return res;
  };
}

module.exports = {
  getSubscribers: getSubscribers,
};
