const CassandraMixin = require('./services/mixins/cassandra');
const getAuthMiddleware = require('./middlewares/socketIO/auth');
const { globFiles } = require('ms-conf/lib/load-config');
const { mix } = require('mixwith');
const merge = require('lodash/merge');
const MessageService = require('./services/message');
const MService = require('mservice');
const path = require('path');
const PinService = require('./services/pin');
const ParticipantService = require('./services/participant');
const RoomService = require('./services/room');
const UserService = require('./services/user');

const defaultConfig = globFiles(path.resolve(__dirname, 'configs'));
const cassandraServices = {
  pin: PinService,
  participant: ParticipantService,
  room: RoomService,
  message: MessageService,
};

class Chat extends MService {
  /**
   * @param config
   */
  constructor(config = {}) {
    super(merge({}, defaultConfig, config));
    this.services = {};

    this.on('plugin:connect:cassandra', (cassandra) => {
      const hook = this.hook.bind(this);

      Object
        .keys(cassandraServices)
        .forEach((key) => {
          const serviceConfig = this.config.services[key];
          const Service = mix(cassandraServices[key]).with(CassandraMixin);
          const { socketIO, services } = this;

          this.services[key] = new Service(serviceConfig, cassandra, socketIO, services, hook);
        });
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
