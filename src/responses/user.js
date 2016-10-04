const { transformModel, transformCollection } = require('./helpers/jsonAPI');

const TYPE_USER = 'user';

function modelResponse(model) {
  return transformModel(model, TYPE_USER);
}

function collectionResponse(collection, collectionOptions = {}) {
  return transformCollection(collection, TYPE_USER, collectionOptions);
}

module.exports = {
  collectionResponse,
  modelResponse,
  TYPE_USER,
};
