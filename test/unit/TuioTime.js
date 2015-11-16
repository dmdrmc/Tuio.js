var Tuio = require("../../src/Tuio");
Tuio.Time = require("../../src/TuioTime");

QUnit.module("Tuio.Time", {
    setup: function() {
        Tuio.Time.initSession();
    },

    teardown: function() {
        Tuio.Time.startSeconds = 0;
        Tuio.Time.startMicroSeconds = 0;
    }
});

QUnit.test("initialize with sec and usec", function() {
    var time = new Tuio.Time(100, 100000);

    QUnit.equal(time.getSeconds(), 100);
    QUnit.equal(time.getMicroseconds(), 100000);
});


QUnit.test("add few microseconds", function() {
    var time = new Tuio.Time(),
    newTime = time.add(5000);

    QUnit.equal(newTime.getSeconds(), 0);
    QUnit.equal(newTime.getMicroseconds(), 5000);
});

QUnit.test("add lots of microseconds", function() {
    var time = new Tuio.Time(),
    newTime = time.add(10000000);

    QUnit.equal(newTime.getSeconds(), 10);
    QUnit.equal(newTime.getMicroseconds(), 0);
});

QUnit.test("subtract time", function() {
    var time = new Tuio.Time(100, 5000),
    newTime = time.subtractTime(new Tuio.Time(20, 1000));

    QUnit.equal(newTime.getSeconds(), 80);
    QUnit.equal(newTime.getMicroseconds(), 4000);
});

QUnit.test("equals", function() {
    var time1 = new Tuio.Time.fromMilliseconds(2000),
    time2 = new Tuio.Time.fromMilliseconds(2000);

    ok(time1.equals(time2));
    QUnit.equal(time1.getTotalMilliseconds(), time2.getTotalMilliseconds());
});

QUnit.test("reset", function() {
    var time = new Tuio.Time.fromMilliseconds(10000);
    time.reset();

    QUnit.equal(time.getSeconds(), 0);
    QUnit.equal(time.getMicroseconds(), 0);
    QUnit.equal(time.getTotalMilliseconds(), 0);
});

QUnit.test("getSessionTime", function() {
    var systemTime = Tuio.Time.getSystemTime(),
    startTime = Tuio.Time.getStartTime(),
    sessionTime = Tuio.Time.getSessionTime(),
    expectedSessionTime = systemTime.subtractTime(startTime);

    ok(sessionTime.equals(expectedSessionTime));
});