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

  constructor(socket, params, callback, service) {
    if (this.constructor === AbstractAction) {
      throw new Errors.InvalidOperationError('Can\'t construct abstract class');
    }

    if (this.handler === AbstractAction.prototype.handler) {
      throw new Errors.InvalidOperationError('Method \'handler\' must be implemented');
    }

    if (socket.constructor !== Socket) {
      throw new Errors.ArgumentError('socket');
    }

    if (is.undefined(params) === true) {
      throw new Errors.ArgumentError('params');
    }

    if (is.fn(callback) !== true) {
      throw new Errors.ArgumentError('callback');
    }

    if (is.instanceof(service, Service) !== true) {
      throw new Errors.ArgumentError('service');
    }

    this.socket = socket;
    this.params = params;
    this.callback = callback;
    this.service = service;
  }

  /**
   * @returns {Promise}
   */
  handler() {
    throw new Errors.InvalidOperationError('Method \'handler\' must be implemented');
  }

  /**
   * @returns {Promise}
   */
  validate() {
    return this.service.validator.validate(this.constructor.actionName, this.params);
  }

  /**
   * Must returns promise that returns boolean
   *
   * @returns {Promise.<boolean>}
   */
  allowed() {
    return Promise.resolve(false);
  }

  /**
   *
   */
  dispatch() {
    return this.validate().bind(this)
      .then(params => this.params = params)
      .then(this.allowed)
      .then(isAllowed => {
        if (isAllowed === true) {
          return Promise.resolve();
        }

        return Promise.reject(new Errors.NotPermittedError(this.constructor.actionName));
      })
      .then(this.handler)
      .then(result => this.callback(null, result))
      .catch(Errors.ValidationError, Errors.NotPermittedError, (error) => {
        this.callback(error);
      })
      .catch(error => this.service.logger.error(error));
  }
}

module.exports = AbstractAction;
