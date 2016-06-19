const AbstractAction = require('./../../abstractAction');

class RoomsCreateAction extends AbstractAction
{
  handler() {
    const Room = this.service.cassandra.instance.room;
    const room = new Room(Object.assign({ createdBy: this.socket.user.id }, this.params));
    room.save(error => {
      if (error) {
        this.socket.emit('error', error.message);
      } else {
        this.socket.emit('rooms.create', room);
      }
    });
  }

  static get schema() {
    return {
      type: "object",
      required: ['name'],
      properties: {
        "name": {
          "type": "string"
        }
      }
    }
  }

  get allowed() {
    return this.socket.user.isAdmin;
  }
}

module.exports = RoomsCreateAction;
