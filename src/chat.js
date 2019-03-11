const { mix } = require('mixwith');
const merge = require('lodash/merge');
const { Microfleet } = require('@microfleet/core');
const conf = require('./config');
const MessageService = require('./services/message');
const getAuthMiddleware = require('./middlewares/socketIO/auth');
const CassandraMixin = require('./services/mixins/cassandra');
const PinService = require('./services/pin');
const ParticipantService = require('./services/participant');
const RoomService = require('./services/room');
const UserService = require('./services/user');

class Chat extends Microfleet {
  static cassandraServices = {
    pin: PinService,
    participant: ParticipantService,
    room: RoomService,
    message: MessageService,
  };

  static defaultConfig = conf.get('/', {
    env: process.env.NODE_ENV,
  });

  /**
   * @param config
   */
  constructor(config = {}) {
    super(merge({}, Chat.defaultConfig, config));
    this.services = {};

    this.on('plugin:connect:cassandra', (cassandra) => {
      const hook = this.hook.bind(this);

      Object
        .keys(Chat.cassandraServices)
        .forEach((key) => {
          const serviceConfig = this.config.services[key];
          const Service = mix(Chat.cassandraServices[key]).with(CassandraMixin);
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
