const Errors = require('common-errors');
const Promise = require('bluebird');

/**
 * @api {http} <prefix>.rooms.create Create a room
 * @apiVersion 1.0.0
 * @apiName rooms.create
 * @apiGroup Rooms
 * @apiSchema {jsonschema=../../schemas/rooms.create.json} apiParam
 */
function RoomsCreateAction(request) {
  const { auth, params } = request;
  const properties = Object.assign({ createdBy: auth.credentials.id }, params);
  return this.services.room.create(properties);
}

const allowed = request => {
  const { auth } = request;

  if (auth.credentials.isAdmin !== true) {
    return Promise.reject(new Errors.NotPermittedError('Not an admin'));
  }

  return Promise.resolve(request);
};

RoomsCreateAction.allowed = allowed;
RoomsCreateAction.auth = 'token';
RoomsCreateAction.schema = 'rooms.create';
RoomsCreateAction.transports = ['http'];

module.exports = RoomsCreateAction;
