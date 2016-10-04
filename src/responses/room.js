const { transformModel, transformCollection } = require('./helpers/jsonAPI');

const TYPE_ROOM = 'room';

function modelResponse(model) {
  return transformModel(model, TYPE_ROOM);
}

function collectionResponse(collection, collectionOptions = {}) {
  return transformCollection(collection, TYPE_ROOM, collectionOptions);
}

module.exports = {
  collectionResponse,
  modelResponse,
  TYPE_ROOM,
};
