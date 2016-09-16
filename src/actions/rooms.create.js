const Errors = require('common-errors');
const Promise = require('bluebird');
const { modelResponse, TYPE_ROOM } = require('../utils/response');

/**
 * @api {http} <prefix>.rooms.create Create a room
 * @apiVersion 1.0.0
 * @apiName rooms.create
 * @apiGroup Rooms
 * @apiSchema {jsonschema=../../schemas/rooms.create.json} apiParam
 */
function RoomsCreateAction(request) {
  const { auth, params } = request;
  const properties = Object.assign({ createdBy: auth.credentials.user.id }, params);
  return this.services.room
    .create(properties)
    .then(room => modelResponse(room, TYPE_ROOM));
}

const allowed = (request) => {
  const { auth } = request;

  if (auth.credentials.user.isRoot !== true) {
    return Promise.reject(new Errors.NotPermittedError('Not an root'));
  }

  return Promise.resolve(request);
};

RoomsCreateAction.allowed = allowed;
RoomsCreateAction.auth = 'token';
RoomsCreateAction.schema = 'rooms.create';
RoomsCreateAction.transports = ['http'];

module.exports = RoomsCreateAction;
