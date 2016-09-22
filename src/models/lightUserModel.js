/**
 *
 */
class LightUserModel
{
  static ROLE_GUEST = 'guest';
  static ROLE_ROOT = 'root';

  /**
   * @param id
   * @param name
   * @param roles
   */
  constructor(id, name, roles = []) {
    this.id = id;
    this.name = name;
    this.roles = roles;
  }

  /**
   * @returns {boolean}
   */
  get isGuest() {
    return this.roles.includes(LightUserModel.ROLE_GUEST);
  }

  /**
   * @returns {boolean}
   */
  get isRoot() {
    return this.roles.includes(LightUserModel.ROLE_ROOT);
  }
}

module.exports = LightUserModel;
