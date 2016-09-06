const _ = require('lodash');
const getAuthMiddleware = require('./middlewares/socketIO/auth');
const { globFiles } = require('ms-conf/lib/load-config');
const MessageService = require('./services/message');
const MService = require('mservice');
const path = require('path');
const RoomService = require('./services/room');

const defaultConfig = globFiles(path.resolve(__dirname, 'configs'));

class Chat extends MService {
  /**
   * @param config
   */
  constructor(config = {}) {
    super(_.merge({}, defaultConfig, config));

    this.on('plugin:connect:cassandra', cassandra => {
      this.services = {
        message: new MessageService(cassandra),
        room: new RoomService(cassandra),
      };
    });

    this.on('plugin:start:http', () => {
      this.socketIO.use(getAuthMiddleware(this));
    });
  }
}

module.exports = Chat;
