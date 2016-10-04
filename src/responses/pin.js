const { transformModel, transformCollection, processModel } = require('./helpers/jsonAPI');

const TYPE_PIN = 'pin';

const castOptions = {
  id: (value, model) => model.messageId,
};

function modelResponse(model) {
  return transformModel(model, TYPE_PIN, { castOptions });
}

function collectionResponse(collection, collectionOptions = {}) {
  return transformCollection(collection, TYPE_PIN, collectionOptions, { castOptions });
}

function transform(model) {
  return processModel(model, TYPE_PIN, { castOptions });
}

module.exports = {
  transform,
  collectionResponse,
  modelResponse,
  TYPE_PIN,
};
