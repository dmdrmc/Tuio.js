$(document).ready(function() {
    QUnit.module("Tuio.Cursor", {
        setup: function() {

        },

        teardown: function() {

        }
    });

    QUnit.test("construct", function() {
        var cursor = new Tuio.Cursor({
            ttime: new Tuio.Time(),
            si: 1,
            ci: 5,
            xp: 10,
            yp: 20
        });

        QUnit.equal(cursor.getSessionId(), 1);
        QUnit.equal(cursor.getCursorId(), 5);
        QUnit.equal(cursor.getX(), 10);
        QUnit.equal(cursor.getY(), 20);
        QUnit.equal(cursor.getXSpeed(), 0);
        QUnit.equal(cursor.getYSpeed(), 0);
        QUnit.equal(cursor.getMotionSpeed(), 0);
        QUnit.equal(cursor.getMotionAccel(), 0);
        QUnit.equal(cursor.getPath().length, 1);
        QUnit.equal(cursor.getTuioState(), Tuio.Container.TUIO_ADDED);
    });

    QUnit.test("fromCursor", function() {
       var cursor1 = new Tuio.Cursor({
            ttime: new Tuio.Time(),
            si: 1,
            ci: 5,
            xp: 10,
            yp: 20
        }),

        cursor2 = Tuio.Cursor.fromCursor(cursor1);

        QUnit.equal(cursor2.getSessionId(), 1);
        QUnit.equal(cursor2.getCursorId(), 5);
        QUnit.equal(cursor2.getX(), 10);
        QUnit.equal(cursor2.getY(), 20);
        QUnit.equal(cursor2.getXSpeed(), 0);
        QUnit.equal(cursor2.getYSpeed(), 0);
        QUnit.equal(cursor2.getMotionSpeed(), 0);
        QUnit.equal(cursor2.getMotionAccel(), 0);
        QUnit.equal(cursor2.getPath().length, 1);
        QUnit.equal(cursor2.getTuioState(), Tuio.Container.TUIO_ADDED);
    });
});