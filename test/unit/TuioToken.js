(function() {

var Tuio = require("../../src/Tuio");
Tuio.Token = require("../../src/TuioToken");
    
var token;

QUnit.module("Tuio.Token", {
    setup: function() {
        token = new Tuio.Token({
            ttime: new Tuio.Time(),
            ti: 34,
            ui: 134,
            sym: 5,
            xp: 10,
            yp: 20
        });
    },

    teardown: function() {
        token = null;
    }
});

QUnit.test("constructs", function(assert) {
    
    QUnit.equal(token.getSymbolId(), 5);
    QUnit.equal(token.getTypeId(), 34);
    QUnit.equal(token.getUserId(), 134);
    QUnit.equal(token.getX(), 10);
    QUnit.equal(token.getY(), 20);
    QUnit.equal(token.getXSpeed(), 0);
    QUnit.equal(token.getYSpeed(), 0);
    QUnit.equal(token.getMotionSpeed(), 0);
    QUnit.equal(token.getMotionAccel(), 0);
    QUnit.equal(token.getPath().length, 1);
});

QUnit.test("fromToken", function() {

    token2 = Tuio.Token.fromToken(token);
    
    // the only difference should be time
    QUnit.notDeepEqual(token.currentTime, token2.currentTime);
    QUnit.notDeepEqual(token.startTime, token2.startTime);
    
    delete token.currentTime;
    delete token2.currentTime;
    delete token.startTime;
    delete token2.startTime;
    delete token.path[0].currentTime;
    delete token2.path[0].currentTime;
    delete token.path[0].startTime;
    delete token2.path[0].startTime;
    
    //otherwise should be equal
    QUnit.deepEqual(token, token2, "Tuio.token not successfully copied");
});
//
//QUnit.test("sets 16-bit type and user ID based on 32-bit tu_id", function() {
//    
//    //tu_id, two 16-bit values
//    //t_id => 2, u_id => 3
//    // 0x00 0x02 0x00 0x03 => big endian 131075
//    var tu_id = 131075;
//    
//    QUnit.notEqual(token.getTypeId(), 2, "typeId was already 2");
//    token.setTypeUserId(tu_id);
//    
//    QUnit.equal(token.getTypeId(), 2, "typeId not properly set from tu_id");
//    QUnit.equal(token.getUserId(), 3, "userId not properly set from tu_id");
//});
//
})()