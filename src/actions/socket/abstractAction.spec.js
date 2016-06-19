const AbstractAction = require('./abstractAction');
const Errors = require('common-errors');
const expect = require('chai').expect;

describe('AbstractAction', function() {
  describe('#constructor()', function () {
    it('should throw error then trying to instance', function test() {
      expect(() => new AbstractAction()).to.throw(Errors.InvalidOperationError);
    });
  });
});
