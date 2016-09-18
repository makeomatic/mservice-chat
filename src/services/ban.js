class BanService
{
  static castOptions = {
    roomId: 'Uuid',
  };

  static defaultData = {
    bannedAt: () => new Date(),
  };

  static modelName = 'ban';

  add(roomId, user, bannedBy, reason) {
    const params = {
      bannedBy,
      reason,
      roomId,
      user,
      userId: user.id,
    };

    return this.create(params);
  }

  findById(roomId, userId) {
    return this.findOne({ roomId, userId });
  }
}

module.exports = BanService;
