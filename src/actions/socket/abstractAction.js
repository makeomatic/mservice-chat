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

  constructor(application) {
    if (this.constructor === AbstractAction) {
      throw new Errors.InvalidOperationError('Can\'t construct abstract class');
    }

    if (this.handler === AbstractAction.prototype.handler) {
      throw new Errors.InvalidOperationError('Method \'handler\' must be implemented');
    }

    if (is.instanceof(application, Service) !== true) {
      throw new Errors.ArgumentError('application');
    }

    this.application = application;
  }

  /**
   * @returns {Promise}
   */
  handler(socket, context, callback) {
    throw new Errors.InvalidOperationError('Method \'handler\' must be implemented');
  }

  /**
   * @returns {Promise}
   */
  validate(socket, context, callback) {
    return this.application.validator.validate(this.constructor.actionName, context.params);
  }

  /**
   * Must returns promise that returns boolean
   *
   * @returns {Promise.<boolean>}
   */
  allowed(socket, context, callback) {
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

    let context = {
      user: socket.user,
      params,
    };

    return this.validate(socket, context, callback).bind(this)
      .then(sanitizedParams => {
        context.params = sanitizedParams;

        return [socket, context, callback]
      })
      .spread(this.allowed)
      .then(isAllowed => {
        if (isAllowed === true) {
          return [socket, context, callback];
        }

        return Promise.reject(new Errors.NotPermittedError(this.constructor.actionName));
      })
      .spread(this.handler)
      .asCallback((error, result) => {
        context = null;

        if (error) {
          switch (error.constructor) {
            case Errors.ValidationError:
            case Errors.NotPermittedError:
              return callback(error);
            default:
              this.application.log.error(error);
              return callback(new Errors.Error('Something went wrong'));
          }
        }

        callback(null, result);
      });
  }
}

module.exports = AbstractAction;
