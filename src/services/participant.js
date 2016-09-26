const { timeuuid, timeuuidFromDate } = require('express-cassandra');

class ParticipantService
{
  static castOptions = {
    roomId: 'Uuid',
    joinedAt: 'TimeUuid',
  };

  static defaultData = {
    joinedAt: () => timeuuid(),
    lastActivityAt: () => new Date(),
  };

  static modelName = 'participant';

  add(roomId, user) {
    const { id, name, roles } = user;

    return this.services.ban
      .findById(roomId, id)
      .then(ban => ban !== undefined)
      .then(banned => this.create({ roomId, id, name, roles, banned }));
  }

  updateActivity(roomId, id) {
    return this.update({ roomId, id }, { lastActivityAt: new Date() });
  }

  markAsBanned(roomId, id, banned = true) {
    return this.update({ roomId, id }, { banned });
  }

  list(roomId, before, limit = 20) {
    const query = { roomId };
    const options = { materialized_view: 'participantsSortedByJoinedAt' };

    query.joinedAt = {
      // @todo move to config
      $gt: before || timeuuidFromDate(new Date(Date.now() - (7 * 24 * 60 * 60 * 1000))),
    };

    return this.find(query, { $asc: 'joinedAt' }, limit, options);
  }
}

module.exports = ParticipantService;
