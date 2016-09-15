const omit = require('lodash/omit');

const TYPE_BAN = 'ban';
const TYPE_MESSAGE = 'message';
const TYPE_PIN = 'pin';
const TYPE_ROOM = 'room';
const TYPE_USER = 'user';

function transform(object, type) {
  const response = {
    type,
    attributes: omit(object.toJSON ? object.toJSON() : object, 'id'),
  };

  if (object.id) {
    response.id = object.id;
  }

  return response;
}

function collectionResponse(objects, type, before) {
  const response = {
    meta: {
      count: objects.length,
    },
    data: objects.map(object => transform(object, type)),
  };

  if (objects.length) {
    response.meta.last = objects[0].id;
  }

  if (before) {
    response.meta.before = before;
  }

  return response;
}

function modelResponse(model, type) {
  const response = {
    data: model !== null ? transform(model, type) : null,
  };

  return response;
}

function successResponse() {
  return { meta: { status: 'success' } };
}

module.exports = {
  collectionResponse,
  modelResponse,
  successResponse,
  transform,
  TYPE_BAN,
  TYPE_MESSAGE,
  TYPE_PIN,
  TYPE_ROOM,
  TYPE_USER,
};