(function(){

    var Tuio = require("../../src/Tuio");
    Tuio.ObjectContainer = require("../../src/TuioObjectContainer");
    
    var object;

    QUnit.module("Tuio.ObjectContainer", {
        setup: function() {
            object = new Tuio.ObjectContainer({
                si: 2,
                ttime: new Tuio.Time(),
                src: new Tuio.Source()
            });
        },

        teardown: function() {
            object = null;
        }
    });
    
    QUnit.test("constructs", function() {
        QUnit.ok(object, "TuioObjectContainer didn't instantiate");
        QUnit.strictEqual(object.getSessionId(), 2,
                            "sessionId improperly set");
        QUnit.ok(object.getTuioTime() instanceof Tuio.Time,
                    "start time improperly set");
        QUnit.ok(object.getStartTime() instanceof Tuio.Time,
                    "start time improperly set");
        QUnit.ok(object.getTuioSource() instanceof Tuio.Source,
                    "source improperly set");
    });
    
    QUnit.test("sets time without explicit ttime parameter", function() {
        
        object = new Tuio.ObjectContainer();
        QUnit.ok(object.getStartTime() instanceof Tuio.Time,
                    "system time was not used for starting time");
    });
    
    QUnit.test("has the correct ADDED state on construction", function() {
        
        QUnit.strictEqual(object.getTuioState(), Tuio.TUIO_ADDED,
                            "improper state on construction");
    });
    
    QUnit.test("stores a pointer", function() {
        
        QUnit.strictEqual(object.getTuioPointer(), null,
                            "Tuio.Pointer was incorrectly set");
        
        object.setTuioPointer(new Tuio.Pointer());
        QUnit.ok(object.getTuioPointer() instanceof Tuio.Pointer,
                    "tuio pointer not set");
    });
    
    QUnit.test("marks a pointer for removal", function() {
        
        var time = Tuio.Time.getSystemTime();
        
        QUnit.notOk(object.getTuioTime().equals(time),
                            "current time equals new time before removal");
        
        object.setTuioPointer(new Tuio.Pointer());
        object.remove(time);
        
        QUnit.strictEqual(object.getTuioState(), Tuio.TUIO_REMOVED,
                            "state not set to removed");
        QUnit.ok(object.getTuioTime().equals(time),
                            "new tuio time not properly set");
        QUnit.strictEqual(object.getTuioPointer().getTuioState(), Tuio.TUIO_REMOVED,
                            "object pointer status not set to removed");
    });
    
    QUnit.test("deletes a pointer", function() {
        
        object.setTuioPointer(new Tuio.Pointer());
        object.deleteTuioPointer();
        QUnit.notOk(object.getTuioPointer(), "pointer was not removed from object");
    });
    
    QUnit.test("checks if it contains a pointer", function() {
        
        QUnit.strictEqual(object.containsTuioPointer(), false, 
                            "does not indicate it contains no pointer");
        
        object.setTuioPointer(new Tuio.Pointer());
        QUnit.strictEqual(object.containsTuioPointer(), true, 
                            "does not indicate it contains a pointer");
        
    });
    
    QUnit.test("checks if it contains a new pointer", function() {
       
        var time = Tuio.Time.getSystemTime();
        
        QUnit.strictEqual(object.containsNewTuioPointer(), false,
                            "contains a new pointer when it has no pointer");
        
        object.setTuioPointer(new Tuio.Pointer());
        QUnit.strictEqual(object.containsNewTuioPointer(), true,
                            "does not contains a freshly added pointer");
        
        object.getTuioPointer().updatePathAndState();
        QUnit.strictEqual(object.containsNewTuioPointer(), false,
                            "pointer was updated, should not have state ADDED like a new pointer");
    });
    
    QUnit.test("updates the time and state", function() {
        
        var time = Tuio.Time.getSystemTime();
        
        object.update(time);
        QUnit.strictEqual(object.getTuioTime().equals(time), true,
                            "current time does not equal update time");
        QUnit.strictEqual(object.getTuioState(), Tuio.TUIO_IDLE,
                            "current state not idle");
    });
    
    QUnit.test("tests if it's moving", function() {
        
        var pointer = new Tuio.Pointer({
            xp: 1,
            yp: 1
        })
        object.setTuioPointer(pointer);
        
        QUnit.strictEqual(object.isMoving(), false,
                            "does not indicate it is not moving when only now set");
        
        pointer.update({
            xp: 2,
            yp: 2
        });
        QUnit.strictEqual(object.isMoving(), true,
                            "does not indicate it is moving");
    });
    
    QUnit.test("marks the pointer as stopped", function() {
        
        var time = Tuio.Time.getSystemTime();
        
        object.setTuioPointer(new Tuio.Pointer({
            xp: 1,
            yp: 1
        }));
        object.stop(time);
        QUnit.strictEqual(object.getTuioTime().equals(time), true,
                            "current time not update on stop");
        QUnit.strictEqual(object.getTuioPointer().isMoving(), false,
                            "pointer should not be 'moving'");
    });
    
    QUnit.test("stores a token", function() {
        
        QUnit.strictEqual(object.getTuioToken(), null,
                            "Tuio.Token was incorrectly set");
        
        object.setTuioToken(new Tuio.Token());
        QUnit.ok(object.getTuioToken() instanceof Tuio.Token,
                    "tuio token not set");
    });
    
    QUnit.test("marks a token for removal", function() {
        
        var time = Tuio.Time.getSystemTime();
        
        object.setTuioToken(new Tuio.Token());
        object.remove(time);
        
        QUnit.strictEqual(object.getTuioToken().getTuioState(), Tuio.TUIO_REMOVED,
                            "object token status not set to removed");
    });
    
    QUnit.test("deletes a pointer", function() {
        
        object.setTuioToken(new Tuio.Token());
        object.deleteTuioToken();
        QUnit.notOk(object.getTuioToken(), "token was not removed from object");
    });
    
    QUnit.test("checks if it contains a token", function() {
        
        QUnit.strictEqual(object.containsTuioToken(), false, 
                            "does not indicate it contains no token");
        
        object.setTuioToken(new Tuio.Token());
        QUnit.strictEqual(object.containsTuioToken(), true, 
                            "does not indicate it contains a token");
        
    });
    
    QUnit.test("checks if it contains a new token", function() {
       
        var time = Tuio.Time.getSystemTime();
        
        QUnit.strictEqual(object.containsNewTuioToken(), false,
                            "contains a new token when it has no token");
        
        object.setTuioToken(new Tuio.Token());
        QUnit.strictEqual(object.containsNewTuioToken(), true,
                            "does not contains a freshly added token");
        
        object.getTuioToken().updatePathAndState();
        QUnit.strictEqual(object.containsNewTuioToken(), false,
                            "token was updated, should not have state ADDED like a new token");
    });
    
})();