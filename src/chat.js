const _ = require('lodash');
const authMiddleware = require('./middlewares/socket/auth');
const confidence = require('ms-conf');
const { globFiles } = require('ms-conf/lib/load-config');
const MService = require('mservice');
const path = require('path');
const RoomService = require('./services/room');
const SocketService = require('./services/socket');

const defaultConfig = globFiles(path.resolve(__dirname, 'configs'));

/**
 * @param {Chat} application
 */
function initServices(application) {
  application.services = {
    socket: new SocketService(application),
  };

  application.on('plugin:connect:cassandra', cassandra => {
    application.services.room = new RoomService(cassandra);
  });
}

/**
 * @property {object} services
 * @property {Room} services.room
 * @property {SocketService} services.socket
 */
class Chat extends MService {
  /**
   * @param config
   */
  constructor(config = {}) {
    super(_.merge({}, defaultConfig, config, confidence.get('/')));
    initServices(this);

    this.on('plugin:start:http', () => {
      const chat = this.socketio.of(this.config.chat.namespace);
      chat.use(authMiddleware.bind(this));
      this.services.socket.bindActions(chat, path.resolve(__dirname, 'actions/socket/actions'));
    });
  }
}

module.exports = Chat;
