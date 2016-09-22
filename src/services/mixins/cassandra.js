const { datatypes } = require('express-cassandra');
const Errors = require('common-errors');
const Flakeless = require('ms-flakeless');
const is = require('is');
const mapValues = require('lodash/mapValues');
const Promise = require('bluebird');

function defaultDataMapper(value) {
  if (is.fn(value) === true) {
    return value();
  }

  return value;
}

module.exports = superclass => class Mixin extends superclass {
  constructor(config, cassandraClient, socketIO, services) {
    super();

    if (superclass.modelName === undefined) {
      throw new Errors.Argument('this.model');
    }

    const model = cassandraClient.modelInstance[superclass.modelName];

    if (model === undefined) {
      throw new Errors.Argument('cassandraClient', `Model "${superclass.modelName}" not found`);
    }

    if (config && config.flakeless) {
      this.flakeless = new Flakeless(config.flakeless);
    }

    this.config = config;
    this.model = Promise.promisifyAll(model);
    this.services = services;
    this.socketIO = socketIO;
  }

  getDefaultData() {
    const defaultData = superclass.defaultData || this.defaultData();

    if (is.object(defaultData) === true) {
      return mapValues(defaultData, defaultDataMapper);
    }

    return {};
  }

  create(properties, options = {}) {
    const Model = this.model;
    const defaultData = this.getDefaultData();

    return Promise
      .bind(this, defaultData)
      .then(data => Object.assign(data, properties))
      .then(this.castData)
      .then(data => new Model(data))
      .tap(model => model.saveAsync(options));
  }

  find(cond = {}, sort = {}, limit = 20, options = {}) {
    const query = this.makeCond(cond, sort, limit);

    return this.model.findAsync(query, options);
  }

  findOne(cond = {}, sort = {}) {
    const query = this.makeCond(cond, sort);

    return this.model.findOneAsync(query);
  }

  update(cond = {}, update = {}, options = {}) {
    const query = this.makeCond(cond);

    return this.model.updateAsync(query, update, options);
  }

  delete(cond = {}) {
    const query = this.makeCond(cond);

    return this.model
      .deleteAsync(query)
      .tap(() => {
        if (super.afterDelete) {
          return super.afterDelete(cond);
        }

        return null;
      });
  }

  cast(value, type) {
    const cassandraType = datatypes[type];

    // @todo use express-cassandra/orm/check-types for more complicated cases
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
