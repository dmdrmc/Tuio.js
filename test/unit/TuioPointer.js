(function() {

var Tuio = require("../../src/Tuio");
Tuio.Pointer = require("../../src/TuioPointer");
    
var pointer;

QUnit.module("Tuio.Pointer", {
    setup: function() {
        pointer = new Tuio.Pointer({
            ttime: new Tuio.Time(),
            si: 1,
            ti: 34,
            ui: 134,
            pi: 5,
            xp: 10,
            yp: 20,
            //new
            ci: 1,
            a: 3.14,
            sa: 6,
            r: 11,
            p: 0
        });
    },

    teardown: function() {
        pointer = null;
    }
});

QUnit.test("constructs", function(assert) {
    
    QUnit.equal(pointer.getPointerId(), 5);
    QUnit.equal(pointer.getTypeId(), 34);
    QUnit.equal(pointer.getUserId(), 134);
    QUnit.equal(pointer.getSessionId(), 1);
    QUnit.equal(pointer.getX(), 10);
    QUnit.equal(pointer.getY(), 20);
    QUnit.equal(pointer.getXSpeed(), 0);
    QUnit.equal(pointer.getYSpeed(), 0);
    QUnit.equal(pointer.getMotionSpeed(), 0);
    QUnit.equal(pointer.getMotionAccel(), 0);
    QUnit.equal(pointer.getPath().length, 1);
    //new
    QUnit.equal(pointer.getComponentId(), 1);
    QUnit.equal(pointer.getAngle(), 3.14);
    QUnit.equal(pointer.getShear(), 6);
    QUnit.equal(pointer.getRadius(), 11);
    QUnit.strictEqual(pointer.getPressure(), 0);
});

QUnit.test("fromPointer", function() {

    pointer2 = Tuio.Pointer.fromPointer(pointer);
    
    // the only difference should be time
    QUnit.notDeepEqual(pointer.currentTime, pointer2.currentTime);
    QUnit.notDeepEqual(pointer.startTime, pointer2.startTime);
    
    delete pointer.currentTime;
    delete pointer2.currentTime;
    delete pointer.startTime;
    delete pointer2.startTime;
    delete pointer.path[0].currentTime;
    delete pointer2.path[0].currentTime;
    delete pointer.path[0].startTime;
    delete pointer2.path[0].startTime;
    
    //otherwise should be equal
    QUnit.deepEqual(pointer, pointer2, "Tuio.Pointer not successfully copied");
});

QUnit.test("sets 16-bit type and user ID based on 32-bit tu_id", function() {
    
    //tu_id, two 16-bit values
    //t_id => 2, u_id => 3
    // 0x00 0x02 0x00 0x03 => big endian 131075
    var tu_id = 131075;
    
    QUnit.notEqual(pointer.getTypeId(), 2, "typeId was already 2");
    pointer.setTypeUserId(tu_id);
    
    QUnit.equal(pointer.getTypeId(), 2, "typeId not properly set from tu_id");
    QUnit.equal(pointer.getUserId(), 3, "userId not properly set from tu_id");
});
    
})()