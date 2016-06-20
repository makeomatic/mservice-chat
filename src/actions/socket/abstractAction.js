const Service = require('mservice');
const Errors = require('common-errors');
const is = require('is');
const Promise = require('bluebird');
const Socket = require('socket.io/lib/socket');

/**
 * @abstract
 */
class AbstractAction {
  /**
   * Converts class name from camelcase to dot separated format
   * and removes trailing action part
   * e.g. MySuperAction => my.super
   *
   * @returns {string}
   */
  static get actionName() {
    return this.name
      .replace(/([A-Z])/g, path => `.${path.toLowerCase()}`)
      .substring(1)
      .replace('.action', '');
  }

  constructor(service) {
    if (this.constructor === AbstractAction) {
      throw new Errors.InvalidOperationError('Can\'t construct abstract class');
    }

    if (this.handler === AbstractAction.prototype.handler) {
      throw new Errors.InvalidOperationError('Method \'handler\' must be implemented');
    }

    if (is.instanceof(service, Service) !== true) {
      throw new Errors.ArgumentError('service');
    }

    this.service = service;
  }

  /**
   * @returns {Promise}
   */
  handler(socket, params) {
    throw new Errors.InvalidOperationError('Method \'handler\' must be implemented');
  }

  /**
   * @returns {Promise}
   */
  validate(socket, params, callback) {
    return this.service.validator.validate(this.constructor.actionName, params);
  }

  /**
   * Must returns promise that returns boolean
   *
   * @returns {Promise.<boolean>}
   */
  allowed(socket, params, callback) {
    return Promise.resolve(false);
  }

  /**
   *
   */
  dispatch(socket, params, callback) {
    if (socket.constructor !== Socket) {
      throw new Errors.ArgumentError('socket');
    }

    if (is.fn(callback) !== true) {
      throw new Errors.ArgumentError('callback');
    }

    return this.validate(socket, params, callback).bind(this)
      .then(sanitizedParams => [socket, params = sanitizedParams, callback])
      .spread(this.allowed)
      .then(isAllowed => {
        if (isAllowed === true) {
          return [socket, params, callback];
        }

        return Promise.reject(new Errors.NotPermittedError(this.constructor.actionName));
      })
      .then(this.handler)
      .asCallback((error, result) => {
        if (error) {
          switch (error.constructor) {
            case Errors.ValidationError:
            case Errors.NotPermittedError:
              return callback(error);
            default:
              this.service.log.error(error);
              return callback(new Errors.Error('Something went wrong'));
          }
        }

        callback(null, result);
      });
  }
}

module.exports = AbstractAction;
