const is = require('is');
const mapValues = require('lodash/mapValues');
const Promise = require('bluebird');
const { datatypes } = require('express-cassandra');

module.exports = superclass => class extends superclass {
  create(properties) {
    const Model = this.model;
    const defaultData = this.getDefaultData();

    return Promise
      .resolve(defaultData)
      .then(data => Object.assign(data, properties))
      .then(data => new Model(data))
      .tap(model => model.saveAsync());
  }

  getDefaultData() {
    const defaultData = this.defaultData;

    if (is.function(defaultData) === true) {
      return defaultData();
    }

    if (is.object(defaultData) === true) {
      return defaultData;
    }

    return Promise.resolve({});
  }

  find(cond = {}, sort = {}, limit = 20) {
    const query = this.makeCond(cond, sort, limit);

    return this.model.findAsync(query);
  }

  findOne(cond = {}, sort = {}, limit = 20) {
    const query = this.makeCond(cond, sort, limit);

    return this.model.findOneAsync(query);
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
    const castOptions = this.castOptions || {};

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
