const AbstractAction = require('./../../abstractAction');

/**
 *
 */
class RoomsMessageAction extends AbstractAction
{
  /**
   *
   */
  handler() {
    this.socket.nsp.in(this.params.id).emit('rooms.message', this.socket.user.name, this.params);
  }

  /**
   * @returns {{type: string, required: string[], properties: {message: {type: string}, type: {type: string}}}}
   */
  static get schema() {
    return {
      type: 'object',
      required: ['id', 'message'],
      properties: {
        id: {
          type: 'string',
        },
        message: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string'
            },
            type: {
              type: 'string'
            }
          }
        }
      }
    }
  }

  /**
   * @returns {boolean}
   * @returns {Promise}
   */
  get allowed() {
    if (this.params.message.type) {
      return this.socket.user.isAdmin;
    }

    return this.socket.rooms.hasOwnProperty(this.params.id);
  }
}

module.exports = RoomsMessageAction;
