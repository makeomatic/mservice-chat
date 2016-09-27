const Errors = require('common-errors');
const { timeuuid } = require('express-cassandra');

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

  getById(roomId, id) {
    return this
      .findOne({ roomId, id })
      .tap((participant) => {
        if (!participant) {
          throw new Errors.NotFoundError(`Participant #${id} not found`);
        }
      });
  }

  add(roomId, user) {
    const { id, name, roles } = user;

    return this.create({ roomId, id, name, roles });
  }

  updateActivity(roomId, id) {
    return this.update({ roomId, id }, { lastActivityAt: new Date() });
  }

  ban(roomId, id, bannedBy, reason) {
    return this.update({ roomId, id }, { bannedBy, reason, bannedAt: new Date() });
  }

  // refactor it after https://github.com/masumsoft/express-cassandra/issues/71
  unban(participant) { // eslint-disable-line class-methods-use-this
    participant.bannedBy = null;
    participant.reason = null;
    participant.bannedAt = null;

    if (participant.roles === null) {
      participant.roles = [];
    }

    return participant.saveAsync();
  }

  list(roomId, before, limit = 20) {
    const query = { roomId };
    const options = { materialized_view: 'participantsSortedByJoinedAt' };

    if (before) {
      query.joinedAt = { $gt: before };
    }

    return this.find(query, { $asc: 'joinedAt' }, limit, options);
  }
}

module.exports = ParticipantService;
