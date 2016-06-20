const Errors = require('common-errors');
const fs = require('fs');
const glob = require('glob');
const is = require('is');

/**
 * @param {Chat} application
 */
class SocketService {

  /**
   * @param {Chat} application
   */
  constructor(application) {
    this.application = application;
  }

  /**
   * @param namespace
   * @param actionsDirectory
   */
  bindActions(namespace, actionsDirectory) {
    if (!fs.existsSync(actionsDirectory)) {
      const error = new Errors.Error(`${ actionsDirectory } does not exist`);
      throw new Errors.ArgumentError('actionsDirectory', error);
    }

    const actions = glob.sync('**/*.js', {cwd: actionsDirectory, realpath: true})
      .reduce((actions, file) => {
        const Action = require(file);
        const action = new Action(this.application);
        actions[Action.actionName] = function dispatch(params, callback) {
          return action.dispatch(this, params, callback);
        };

        return actions;
      }, {});

    namespace.on('connection', socket => {
      Object.keys(actions).forEach(actionName => socket.on(actionName, actions[actionName]));
    });
  }
}

module.exports = SocketService;
