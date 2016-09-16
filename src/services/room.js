const Errors = require('common-errors');
const { uuid } = require('express-cassandra');

class RoomService
{
  static castOptions = {
    id: 'Uuid',
  };

  static defaultData = {
    banned: () => [],
    id: () => uuid(),
    createdAt: () => new Date().toISOString(),
  };

  static modelName = 'room';

  /**
   * @param {string} id
   * @returns {Promise}
   */
  getById(id) {
    const query = this.makeCond({ id });

    return this.model
      .findOneAsync(query)
      .tap((room) => {
        if (!room) {
          throw new Errors.NotFoundError(`Room #${id} not found`);
        }
      });
  }

  afterDelete(cond) {
    const { message } = this.services;

    return message
      .delete({ roomId: cond.id });
  }
}

module.exports = RoomService;
