const is = require('is');
const LightUserModel = require('./../models/lightUserModel');
const Promise = require('bluebird');
const uid2 = require('uid2');
const uuid = require('node-uuid');

function auth(token, application) {
  if (is.undefined(token) === true) {
    return Promise.resolve(new LightUserModel(uuid.v4(), `Guest#${uid2(6)}`));
  }

  const { user } = application.services;

  return user.login(token);
}

module.exports = auth;
