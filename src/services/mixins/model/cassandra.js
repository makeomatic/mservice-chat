const { datatypes } = require('express-cassandra');
const Errors = require('common-errors');
const is = require('is');
const mapValues = require('lodash/mapValues');
const Promise = require('bluebird');

module.exports = superclass => class Mixin extends superclass {
  constructor(cassandraClient, socketIO) {
    super();

    if (superclass.modelName === undefined) {
      throw new Errors.Argument('this.model');
    }

    const model = cassandraClient.modelInstance[superclass.modelName];

    if (model === undefined) {
      throw new Errors.Argument('cassandraClient', `Model "${superclass.modelName}" not found`);
    }

    this.model = Promise.promisifyAll(model);
    this.socketIO = socketIO;
  }

  create(properties) {
    const Model = this.model;
    const defaultData = Mixin.getDefaultData();

    return Promise
      .resolve(defaultData)
      .then(data => Object.assign(data, properties))
      .then(data => new Model(data))
      .tap(model => model.saveAsync());
  }

  static getDefaultData() {
    const defaultData = superclass.defaultData;

    if (is.object(defaultData) === true) {
      return mapValues(defaultData, value => (is.fn(value) === true ? value() : value));
    }

    return Promise.resolve({});
  }

  find(cond = {}, sort = {}, limit = 20) {
    const query = this.makeCond(cond, sort, limit);

    return this.model.findAsync(query);
  }

  findOne(cond = {}, sort = {}) {
    const query = this.makeCond(cond, sort);

    return this.model.findOneAsync(query);
  }

  delete(cond = {}) {
    const query = this.makeCond(cond);

    return this.model.deleteAsync(query);
  }

  cast(value, type) {
    const cassandraType = datatypes[type];

    // @todo use express-cassandra/orm/check-types for more complicated case
    if (value instanceof cassandraType) {
      return value;
    }

    if (is.object(value) === true) {
      return mapValues(value, val => this.cast(val, type));
    }

    return cassandraType.fromString(value);
  }

  castData(data) {
    const castOptions = superclass.castOptions || {};

    return mapValues(data, (value, key) => {
      const type = castOptions[key];

      if (type) {
        return this.cast(value, type);
      }

      return value;
    });
  }

  makeCond(cond = {}, sort = {}, limit) {
    const query = this.castData(cond);

    if (Object.keys(sort).length) {
      query.$orderby = sort;
    }

    if (limit) {
      query.$limit = limit;
    }

    return query;
  }
};
