const Chat = require('./../src/chat');
const chat = new Chat();

chat.connect()
  .then(() => console.log('connected'))
  .catch(console.error);

process.on('uncaughtException', error => {
  console.log(error);
});
