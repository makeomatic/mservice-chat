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
      listInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },
};
