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
        
        object.setTuioPointer(new Tuio.Pointer());
        object.remove(time);
        
        QUnit.strictEqual(object.getTuioState(), Tuio.TUIO_REMOVED,
                            "state not set to removed");
        QUnit.ok(object.getTuioTime().equals(time),
                            "new tuio time not properly set");
        QUnit.strictEqual(object.getTuioPointer().getTuioState(), Tuio.TUIO_REMOVED,
                            "object pointer status not set to removed");
    });
    
})();