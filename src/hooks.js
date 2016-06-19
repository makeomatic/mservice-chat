const ActionsBinder = require('./services/socket/actionsBinder');
const authMiddleware = require('./middlewares/socket/auth');

function hooks(service) {
  service.on('plugin:start:http', () => {
    const chat = service.socketio.of(service.config.chat.namespace);
    const actionsBinder = new ActionsBinder(chat, service);

    actionsBinder.bind(`${__dirname}/actions/socket/actions`);
    chat.use(authMiddleware.bind(service));
    chat.on('connection', socket => {
      socket.emit('welcome', service.config.chat.welcomeMessage);
      socket.emit('welcome', `You are ${socket.user.name}`);
    });
  });
}

module.exports = hooks;
