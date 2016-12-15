const is = require('is');
const LightUserModel = require('./../models/lightUserModel');
const Promise = require('bluebird');
const uuid = require('uuid/v4');

const { ROLE_GUEST } = LightUserModel;

function auth(token, application) {
  if (is.undefined(token) === true) {
    const id = uuid();

    return Promise.resolve(new LightUserModel(id, `Guest#${id.slice(0, 8)}`, [ROLE_GUEST]));
  }

  const { user } = application.services;

  return user.login(token);
}

module.exports = auth;
