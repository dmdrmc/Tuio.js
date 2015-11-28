var Tuio = require("../../src/Tuio");
Tuio.Point = require("../../src/TuioPoint");

QUnit.module("Tuio.Point", {
    setup: function() {

    },

    teardown: function() {

    }
});

QUnit.test("initialize with position", function() {
    var point = new Tuio.Point({xp: 10, yp: 20});

    QUnit.equal(point.getX(), 10);
    QUnit.equal(point.getY(), 20);
});

QUnit.test("initialize with time and position", function() {
    var point = new Tuio.Point({
        ttime: new Tuio.Time(2, 5000),
        xp: 10,
        yp: 20
    });

    QUnit.equal(point.getX(), 10);
    QUnit.equal(point.getY(), 20);
    QUnit.ok(point.currentTime.equals(point.getTuioTime()));
    QUnit.ok(point.startTime.equals(point.getStartTime()));
});

QUnit.test("updateToPoint", function() {
    var point1 = new Tuio.Point({xp: 2, yp: 18}),
    point2 = new Tuio.Point({xp: 4, yp: 4});
    point1.updateToPoint(point2);

    QUnit.equal(point1.getX(), 4);
    QUnit.equal(point1.getY(), 4);
});

QUnit.test("getDistance", function() {
    var point = new Tuio.Point({xp: 0, yp: 0});

    QUnit.equal(point.getDistance(0, 10), 10);
});

QUnit.test("getDistanceToPoint", function() {
    var point1 = new Tuio.Point({xp: 2, yp: 2}),
    point2 = new Tuio.Point({xp: 6, yp: 2});

    QUnit.equal(point1.getDistanceToPoint(point2), 4);
});

QUnit.test("getAngleDegrees", function() {
    var point = new Tuio.Point({xp: 10, yp: 10});

    QUnit.equal(point.getAngleDegrees(20, 20), 315);
});

QUnit.test("getAngleDegreesToPoint", function() {
    var point1 = new Tuio.Point({xp: 100, yp: 100}),
    point2 = new Tuio.Point({xp: 50, yp: 50});

    QUnit.equal(point1.getAngleDegreesToPoint(point2), 135);
});

QUnit.test("getScreenX/Y", function() {
    var point = new Tuio.Point({xp: 0.5, yp: 0.1});

    QUnit.equal(point.getScreenX(800), 400);
    QUnit.equal(point.getScreenY(600), 60);
});