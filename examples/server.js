const Chat = require('./../src');
const chat = new Chat();

chat.connect()
  .then(() => {
    console.log(`connected on ${chat.http.address().port}`);
  })
  .catch(error => {
    throw error;
  });

process.on('uncaughtException', error => {
  throw error;
});

process.on('unhandledRejection', error => {
  throw error;
});
