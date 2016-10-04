const Errors = require('common-errors');
const fetchRoom = require('./../fetchers/room')();
const isElevated = require('../services/roles/isElevated');
const Promise = require('bluebird');
const { successResponse } = require('../responses/success');
/**
 * @api {http} <prefix>.rooms.delete Delete a room
 * @apiVersion 1.0.0
 * @apiName rooms.delete
 * @apiGroup Rooms
 * @apiSchema {jsonschema=../../schemas/rooms.delete.json} apiParam
 */
function RoomsDeleteAction(request) {
  const { id } = request.params;

  return this.services.room
    .delete({ id })
    .then(successResponse);
}

const allowed = (request) => {
  const { auth, room } = request;

  if (isElevated(auth.credentials.user, room) !== true) {
    return Promise.reject(new Errors.NotPermittedError('Has not access'));
  }

  return Promise.resolve(request);
};

RoomsDeleteAction.allowed = allowed;
RoomsDeleteAction.auth = 'token';
RoomsDeleteAction.fetcher = fetchRoom;
RoomsDeleteAction.schema = 'rooms.delete';
RoomsDeleteAction.transports = ['http'];

module.exports = RoomsDeleteAction;
