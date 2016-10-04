const { transformModel, transformCollection } = require('./helpers/jsonAPI');

const TYPE_MESSAGE = 'message';

function modelResponse(model) {
  return transformModel(model, TYPE_MESSAGE);
}

function collectionResponse(collection, collectionOptions = {}) {
  return transformCollection(collection, TYPE_MESSAGE, collectionOptions);
}

module.exports = {
  collectionResponse,
  modelResponse,
  TYPE_MESSAGE,
};
