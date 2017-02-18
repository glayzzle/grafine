var should = require("should");

var grafine = require('../index');
var db = new grafine.graph(2);
describe('Test points', function() {
    var a, b;
    it('should create', function() {
        a = db.create();
        a.index('name', 'a');
        b = db.create();
        b.index('name', 'b');
    });
    it('should link', function() {
        a.add('child', b);
        b.uuid.should.be.exactly(a.first('child'));
    });
    it('should remove', function() {
        b.delete();
        (a.first('child') === null).should.be.true;
    });
    it('should find', function() {
        var items = db.search({
            name: 'a'
        });
        items.length.should.be.exactly(1);
        a.uuid.should.be.exactly(items[0]);
    });
    it('should not find', function() {
        var items = db.search({
            name: 'b'
        });
        items.length.should.be.exactly(0);
    });
});
