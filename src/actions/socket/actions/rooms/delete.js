const AbstractAction = require('./../../abstractAction');
const Promise = require('bluebird');
const Room = require('./../../../../services/room');

class RoomsDeleteAction extends AbstractAction
{
  handler() {
    const roomName = this.room.name;

    Promise.fromCallback(callback => this.room.delete(callback))
      .then(() => this.socket.emit('rooms.delete', roomName))
      .catch(error => this.socket.error(error));
  }

  static get schema() {
    return {
      type: "object",
      required: ['id'],
      properties: {
        "id": {
          "type": "string"
        }
      }
    }
  }

  get allowed() {
    if (this.socket.user.isAdmin === false) {
      return false;
    }

    return Room.factory(this.service.cassandra).getById(this.params.id)
      .then(room => {
        this.room = room;
        return room.createdBy === this.socket.user.id;
      });
  }
}

module.exports = RoomsDeleteAction;
