class LightUserModel
{
  constructor(id, name, roles = []) {
    this.id = id;
    this.name = name;
    this.roles = roles;
  }

  get isGuest() {
    return this.roles.length === 0;
  }

  get isAdmin() {
    return this.roles.indexOf('admin') !== -1;
  }
}

function authMiddleware(socket, next) {
  if (socket.handshake.query.token) {
    return this.amqp.publishAndWait('users.verify', {token : socket.handshake.query.token }, { timeout: 5000 })
      .then(reply => {
        socket.user = new LightUserModel(reply.id, `${reply.firstName} ${reply.lastName}`, reply.roles);
        next();
      })
      .catch(error => socket.error(error));
  } else {
    socket.user = new LightUserModel(socket.id, 'Guest' + socket.id.slice(-4), ['admin']);
    next();
  }
}

module.exports = authMiddleware;
