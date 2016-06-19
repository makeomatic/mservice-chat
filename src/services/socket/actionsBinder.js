const Errors = require('common-errors');
const fs = require('fs');
const glob = require('glob');
const is = require('is');

class ActionsBinder
{
  constructor(namespase, service) {
    this.namespace = namespase;
    this.service = service;
  }

  bind(actionsDirectory) {
    const binder = this;

    if (!fs.existsSync(actionsDirectory)) {
      const error = new Errors.Error(`${ actionsDirectory } does not exist`);
      throw new Errors.ArgumentError('actionsDirectory', error);
    }

    function actionsReducer(actions, file) {
      const Action = require(file);
      actions[Action.actionName] = Action;

      if (Action.schema) {
        binder.service.validator.ajv.addSchema(Action.schema, Action.validatorName);
      }

      return actions;
    }

    const actions = glob.sync('**/*.js', { cwd: actionsDirectory, realpath: true })
      .reduce(actionsReducer, {});

    this.namespace.on('connection', socket => {
      Object.keys(actions).forEach((actionName) => socket.on(actionName, function (params) {
        const action = new actions[actionName](socket, params, binder.service);
        action.dispatch();
      }));
    });
  }
}

module.exports = ActionsBinder;
