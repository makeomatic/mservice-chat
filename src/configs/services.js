module.exports = {
  services: {
    message: {
      flakeless: {
        epochStart: Date.now(),
        outputType: 'base10',
        workerID: 0,
      },
    },
    participant: {
      ttl: 60 * 60 * 24 * 3,
    },
  },
};
