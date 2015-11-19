var Tuio = require("../../src/Tuio");
Tuio.Pointer = require("../../src/TuioPointer");

QUnit.module("Tuio.Pointer", {
    setup: function() {

    },

    teardown: function() {

    }
});

QUnit.test("constructs", function(assert) {
    
    var pointer = new Tuio.Pointer({
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
   var pointer1 = new Tuio.Pointer({
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
    }),

    pointer2 = Tuio.Pointer.fromPointer(pointer1);

    QUnit.equal(pointer2.getPointerId(), 5);
    QUnit.equal(pointer2.getTypeId(), 34);
    QUnit.equal(pointer2.getUserId(), 134);
    QUnit.equal(pointer2.getSessionId(), 1);
    QUnit.equal(pointer2.getX(), 10);
    QUnit.equal(pointer2.getY(), 20);
    QUnit.equal(pointer2.getXSpeed(), 0);
    QUnit.equal(pointer2.getYSpeed(), 0);
    QUnit.equal(pointer2.getMotionSpeed(), 0);
    QUnit.equal(pointer2.getMotionAccel(), 0);
    QUnit.equal(pointer2.getPath().length, 1);
    QUnit.equal(pointer2.getTuioState(), Tuio.Container.TUIO_ADDED);
    //new
    QUnit.equal(pointer2.getComponentId(), 1);
    QUnit.equal(pointer2.getAngle(), 3.14);
    QUnit.equal(pointer2.getShear(), 6);
    QUnit.equal(pointer2.getRadius(), 11);
    QUnit.strictEqual(pointer2.getPressure(), 0);
});