const Errors = require('common-errors');
const Promise = require('bluebird');

class Action {
  static get actionName() {
    return this.name
      .replace(/([A-Z])/g, path => `.${path.toLowerCase()}`)
      .substring(1)
      .replace('.action', '');
  }

  static get validatorName() {
    return `socketio_actions_${ this.actionName }`;
  }

  constructor(socket, params, service) {
    this.socket = socket;
    this.params = params;
    this.service = service;

    if (this.constructor.schema) {
      this.enableValidation();
    }

    this.enablePermissionsCheck();
  }

  enableValidation() {
    this.use(next => {
      this.service.validator.validate(this.constructor.validatorName, this.params)
        .then(params => {
          this.params = params;
          next();
        })
        .catch(error => {
          if (error.name === 'ValidationError') {
            this.socket.error(error);
          } else {
            throw error;
          }
        });
    });
  }

  enablePermissionsCheck() {
    this.use(next => {
      Promise.resolve(this.allowed)
        .then(isAllowed => {
          if (isAllowed) {
            next();
          } else {
            this.socket.error(new Errors.NotPermittedError(this.constructor.actionName));
          }
        });
    });
  }

  use(fn) {
    this.run = ((stack) => (next) => stack(() => fn.call(this, next.bind(this))))(this.run);
  }

  run(next) {
    next.call(this);
  }

  dispatch() {
    this.run(this.handler);
  }
}

module.exports = Action;
