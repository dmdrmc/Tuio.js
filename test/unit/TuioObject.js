var Tuio = require("../../src/Tuio");
Tuio.Object = require("../../src/TuioObject");

QUnit.module("Tuio.Object", {
    setup: function() {

    },

    teardown: function() {

    }
});

QUnit.test("construct", function() {
    var object = new Tuio.Object({
        sym: 2,
        a: Math.PI
    });

    QUnit.equal(object.getX(), 0);
    QUnit.equal(object.getY(), 0);
    QUnit.equal(object.getSymbolId(), 2);
    QUnit.equal(object.getAngle(), Math.PI);
    QUnit.equal(object.getAngleDegrees(), 180);
    QUnit.equal(object.getRotationSpeed(), 0);
    QUnit.equal(object.getRotationAccel(), 0);
    ok(!object.isMoving());
});

QUnit.test("update", function() {
    var object = new Tuio.Object({
        ttime: new Tuio.Time(20, 0),
        xp: 0,
        yp: 10,
        sym: 2,
        a: 0
    });

    object.update({
        ttime: new Tuio.Time(25, 0),
        xp: 0,
        yp: 25,
        a: Math.PI
    });

    QUnit.equal(object.getX(), 0);
    QUnit.equal(object.getY(), 25);
    QUnit.equal(object.getAngleDegrees(), 180);
    QUnit.equal(object.getRotationSpeed(), 0.1);
    QUnit.equal(object.getRotationAccel(), 0.02);
    QUnit.equal(object.getTuioState(), Tuio.TUIO_ROTATING);
    ok(object.isMoving());

    object.update({
        ttime: new Tuio.Time(30, 0),
        a: Math.PI / 2,
        rs: 0.05,
        ra: 0.001
    });

    QUnit.equal(object.getAngleDegrees(), 90);
    QUnit.equal(object.getRotationSpeed(), 0.05);
    QUnit.equal(object.getRotationAccel(), 0.001);
});

QUnit.test("stop", function() {
    var object = new Tuio.Object({
        ttime: new Tuio.Time(20, 0),
        xp: 10,
        yp: 10,
        sym: 5,
        a: Math.PI / 4
    });

    object.update({
        ttime: new Tuio.Time(30),
        xp: 20,
        yp: 20,
        a: Math.PI / 2
    });

    ok(object.isMoving());

    object.stop(new Tuio.Time(50, 0));

    QUnit.equal(object.getX(), 20);
    QUnit.equal(object.getY(), 20);
    QUnit.equal(object.getAngle(), Math.PI / 2);
    QUnit.equal(object.getRotationSpeed(), 0);
    ok(object.getTuioTime().equals(new Tuio.Time(50, 0)));
});