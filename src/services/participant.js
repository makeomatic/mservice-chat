const Errors = require('common-errors');
const Promise = require('bluebird');
const { timeuuid } = require('express-cassandra');

class ParticipantService {
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
    if (user.isGuest) {
      return Promise.resolve();
    }

    const { id, name, roles } = user;

    return this.create({ roomId, id, name, roles });
  }

  updateActivity(roomId, id) {
    return this.update({ roomId, id }, { lastActivityAt: new Date() });
  }

  ban(roomId, id, bannedBy, reason) {
    return this.update({ roomId, id }, { bannedBy, reason, bannedAt: new Date() });
  }

  unban(roomId, id) {
    return this.update({ roomId, id }, { bannedBy: null, reason: null, bannedAt: null });
  }

  list(roomId, before, limit = 20) {
    const query = { roomId };
    const options = { materialized_view: 'participantsSortedByJoinedAt' };

    if (before) {
      query.joinedAt = { $gt: before };
    }

    return Promise
      .bind(this, [query, { $asc: 'joinedAt' }, limit, options])
      .spread(this.find)
      .then(this.fetchUsers);
  }

  fetchUsers(participants) {
    if (participants.length === 0) {
      return Promise.resolve(participants);
    }

    const { user: userService } = this.services;
    const usernames = participants
      .reduce((users, participant) => {
        users.add(participant.id);

        if (participant.bannedBy) {
          users.add(participant.bannedBy.id);
        }

        return users;
      }, new Set());

    return userService
      .getMetadata(Array.from(usernames))
      .then(users =>
        participants
          .map((participant) => {
            const user = users[participant.id] || users[participant.id.toLowerCase()] || {
              id: participant.id,
              name: participant.name,
              roles: participant.roles,
            };
            const data = { user };

            if (participant.bannedBy) {
              data.editedBy = users[participant.bannedBy.id] || participant.bannedBy;
            }

            return Object.assign({}, participant.toJSON(), data);
          })
      );
  }
}

module.exports = ParticipantService;
