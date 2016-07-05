module.exports = {
  plugins: [
    'validator', // keep it first
    'logger',    // keep it second
    'amqp',
    'cassandra',
    'http',
    'socketio',
  ],
};
