class ParticipantService
{
  static castOptions = {
    roomId: 'Uuid',
  };

  static defaultData = {
    joinedAt: () => new Date(),
    lastActivityAt: () => new Date(),
  };

  static modelName = 'participant';

  add(roomId, user) {
    const { ttl } = this.config;
    const { id, name, roles } = user;

    return this.services.ban
      .findById(roomId, id)
      .then(ban => ban !== undefined)
      .then(banned => this.create({ roomId, id, name, roles, banned }, { ttl }));
  }

  updateActivity(roomId, id) {
    const { ttl } = this.config;

    return this.update({ roomId, id }, { lastActivityAt: new Date() }, { ttl });
  }

  markAsBanned(roomId, id, banned = true) {
    const { ttl } = this.config;

    return this.update({ roomId, id }, { banned }, { ttl });
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
