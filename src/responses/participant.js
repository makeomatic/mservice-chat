const arrayIfNull = require('./helpers/cast/arrayIfNull');
const { transformModel, transformCollection } = require('./helpers/jsonAPI');

const TYPE_PARTICIPANT = 'participant';
const SERIALIZATION_GROUP_ADMIN = 'admin';
const SERIALIZATION_GROUP_USER = 'user';

const serializationGroups = {
  [SERIALIZATION_GROUP_USER]: {
    exclude: ['bannedBy', 'reason'],
  },
  [SERIALIZATION_GROUP_ADMIN]: {},
};
const castOptions = {
  roles: arrayIfNull,
};

function modelResponse(model, group = SERIALIZATION_GROUP_USER) {
  const options = { serializationGroup: group, serializationGroups, castOptions };

  return transformModel(model, TYPE_PARTICIPANT, options);
}

function collectionResponse(collection, group = SERIALIZATION_GROUP_USER, collectionOptions = {}) {
  const options = { serializationGroup: group, serializationGroups, castOptions };

  return transformCollection(collection, TYPE_PARTICIPANT, collectionOptions, options);
}

module.exports = {
  collectionResponse,
  modelResponse,
  SERIALIZATION_GROUP_ADMIN,
  SERIALIZATION_GROUP_USER,
  TYPE_PARTICIPANT,
};
