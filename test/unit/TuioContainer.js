var Tuio = require("../../src/Tuio");
Tuio.Container = require("../../src/TuioContainer");

QUnit.module("Tuio.Container", {
    setup: function() {

    },

    teardown: function() {

    }
});

QUnit.test("initialize with session id and position", function() {
    var container = new Tuio.Container({
        si: 1,
        xp: 10,
        yp: 20
    });

    QUnit.equal(container.getSessionId(), 1);
    QUnit.equal(container.getX(), 10);
    QUnit.equal(container.getY(), 20);
    QUnit.equal(container.getXSpeed(), 0);
    QUnit.equal(container.getYSpeed(), 0);
    QUnit.equal(container.getMotionSpeed(), 0);
    QUnit.equal(container.getMotionAccel(), 0);
    QUnit.equal(container.getPath().length, 1);
    QUnit.equal(container.getTuioState(), Tuio.TUIO_ADDED);
});

QUnit.test("update", function() {
    var container = new Tuio.Container({
        ttime: new Tuio.Time(0, 0),
        si: 1,
        xp: 0,
        yp: 0
    });

    container.update({
        ttime: new Tuio.Time(2, 0),
        xp: 50,
        yp: 0
    });

    QUnit.equal(container.getX(), 50);
    QUnit.equal(container.getY(), 0);
    QUnit.equal(container.getXSpeed(), 25);
    QUnit.equal(container.getYSpeed(), 0);
    QUnit.equal(container.getMotionSpeed(), 25);
    QUnit.equal(container.getMotionAccel(), 12.5);
    QUnit.equal(container.getPath().length, 2);
    QUnit.equal(container.getTuioState(), Tuio.TUIO_ACCELERATING);

    container.update({
        ttime: new Tuio.Time(3, 0),
        xp: 60,
        yp: 0
    });

    QUnit.equal(container.getTuioState(), Tuio.TUIO_DECELERATING);
});

QUnit.test("update with velocity and acceleration", function() {
    var container = new Tuio.Container({
        ttime: new Tuio.Time(0, 0),
        si: 1,
        xp: 0,
        yp: 0
    });

    container.update({
        ttime: new Tuio.Time(2, 0),
        xp: 50,
        yp: 0,
        xs: 25,
        ys: 0,
        ma: 12.5
    });

    QUnit.equal(container.getX(), 50);
    QUnit.equal(container.getY(), 0);
    QUnit.equal(container.getXSpeed(), 25);
    QUnit.equal(container.getYSpeed(), 0);
    QUnit.equal(container.getMotionAccel(), 12.5);
    QUnit.equal(container.getPath().length, 2);
    QUnit.equal(container.getTuioState(), Tuio.TUIO_ACCELERATING);
});

QUnit.test("stop", function() {
    var container = new Tuio.Container({
        ttime: new Tuio.Time(0, 0),
        si: 1,
        xp: 0,
        yp: 0
    });

    container.update({
        ttime: new Tuio.Time(2, 0),
        xp: 50,
        yp: 0
    });

    container.stop(new Tuio.Time(3, 0));

    QUnit.equal(container.getX(), 50);
    QUnit.equal(container.getY(), 0);
    QUnit.equal(container.getMotionSpeed(), 0);
    QUnit.equal(container.getTuioState(), Tuio.TUIO_DECELERATING);
});

QUnit.test("remove", function() {
    var container = new Tuio.Container({
        si: 1,
        xp: 10,
        yp: 20
    });

    container.remove(new Tuio.Time(2, 0));

    QUnit.equal(container.getTuioState(), Tuio.TUIO_REMOVED);
    ok(container.getTuioTime().equals(new Tuio.Time(2, 0)));
});

QUnit.test("isMoving", function() {
    var container = new Tuio.Container({
        ttime: new Tuio.Time(0, 0),
        si: 1,
        xp: 0,
        yp: 0
    });

    container.update({
        ttime: new Tuio.Time(2, 0),
        xp: 50,
        yp: 0
    });

    ok(container.isMoving());

    container.update({
        ttime: new Tuio.Time(3, 0),
        xp: 60,
        yp: 0
    });

    ok(container.isMoving());
});