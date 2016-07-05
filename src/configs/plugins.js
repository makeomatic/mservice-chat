module.exports = {
  plugins: [
    'validator', // keep it first
    'logger',    // keep it second
    'cassandra',
    'http',
    'socketio',
  ],
};
