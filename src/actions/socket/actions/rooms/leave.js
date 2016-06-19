const AbstractAction = require('./../../abstractAction');

class RoomsLeaveAction extends AbstractAction
{
  handler() {
    const roomId = this.params.id;
    this.socket.nsp.in(roomId).emit('rooms.leave', `${this.socket.user.name} has left`);
    this.socket.leave(roomId);
  }

  static get schema() {
    return {
      type: "object",
      required: ['id'],
      properties: {
        id: {
          type: "string"
        }
      }
    }
  }

  get allowed() {
    return this.socket.rooms.hasOwnProperty(this.params.id);
  }
}

module.exports = RoomsLeaveAction;
