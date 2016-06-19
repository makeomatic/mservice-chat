const AbstractAction = require('./../../abstractAction');

class RoomsJoinAction extends AbstractAction
{
  handler() {
    const roomId = this.params.id;

    if (this.socket.rooms[roomId]) {
      return;
    }

    const Room = this.service.cassandra.instance.room;
    Room.findOne({id: this.service.cassandra.datatypes.Uuid.fromString(this.params.id)}, (error, room) => {
      if (error) {
        return this.socket.error(error);
      }

      this.socket.join(room.id);
      this.socket.nsp.in(room.id).emit('rooms.join', `${this.socket.user.name} joins to ${room.name}`);
    });
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
    return true;
  }
}

module.exports = RoomsJoinAction;
