const AbstractAction = require('./../../abstractAction');

class RoomsListAction extends AbstractAction
{
  handler() {
    const Room = this.service.cassandra.instance.room;
    Room.find({}, (error, rooms) => {
      if (error) {
        this.socket.error(error.message);
      } else {
        this.socket.emit('rooms.list', rooms);
      }
    });
  }

  get allowed() {
    return true;
  }
}

module.exports = RoomsListAction;
