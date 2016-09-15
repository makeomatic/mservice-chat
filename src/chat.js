const merge = require('lodash/merge');
const Flakeless = require('ms-flakeless');
const getAuthMiddleware = require('./middlewares/socketIO/auth');
const { globFiles } = require('ms-conf/lib/load-config');
const MessageService = require('./services/message');
const MService = require('mservice');
const path = require('path');
const BanService = require('./services/ban');
const PinService = require('./services/pin');
const RoomService = require('./services/room');
const UserService = require('./services/user');

const defaultConfig = globFiles(path.resolve(__dirname, 'configs'));
const flakeless = new Flakeless({
  epochStart: Date.now(),
  outputType: 'base10',
});

class Chat extends MService {
  /**
   * @param config
   */
  constructor(config = {}) {
    super(merge({}, defaultConfig, config));
    this.services = {};

    this.on('plugin:connect:cassandra', (cassandra) => {
      this.services.ban = new BanService(cassandra);
      this.services.message = new MessageService(cassandra, flakeless);
      this.services.pin = new PinService(cassandra, this.socketIO);
      this.services.room = new RoomService(cassandra);
    });

    this.on('plugin:connect:amqp', (amqp) => {
      this.services.user = new UserService(this.config.users, amqp);
    });

    this.on('plugin:start:http', () => {
      this.socketIO.use(getAuthMiddleware(this));
    });
  }
}

module.exports = Chat;
