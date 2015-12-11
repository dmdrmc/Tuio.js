(function(root) {
    
var Tuio = root.Tuio;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
    Tuio.Time = require("./TuioTime");
}
    
Tuio.ObjectContainer = Tuio.Model.extend({
    
    pointer: null,
    token: null,
    sessionId: null,
    startTime: null,
    currentTime: null,
    source: null,
    state: null,
    
    initialize: function(params) {
        params = params || {};
        
        this.sessionId = params.si;
        this.startTime = params.ttime || Tuio.Time.getSystemTime();
        this.currentTime = this.startTime;
        this.source = params.src;
        this.state = Tuio.TUIO_ADDED;
    },
    
    remove: function(ttime) {
        this.removeTuioPointer(ttime);
        this.removeTuioToken(ttime);
        this.state = Tuio.TUIO_REMOVED;
    },
    
    update: function(ttime) {
        this.currentTime = ttime;
        this.state = Tuio.TUIO_IDLE;
    },
    
    stop: function(ttime) {
        if (this.pointer) {
            this.pointer.stop(ttime);
        }
        if (this.token) {
            this.token.stop(ttime);
        }
        this.currentTime = ttime;
    },
    
    isMoving: function() {
        return (this.containsTuioPointer() &&
                    this.pointer.isMoving()) ||
                (this.containsTuioPointer() &&
                    this.pointer.isMoving());
    },
    
    removeTuioPointer: function(ttime) {
        if (this.pointer) {
            this.pointer.remove(ttime);
        }
        this.currentTime = ttime;
    },
    
    deleteTuioPointer: function() {
        this.pointer = null;
    },
    
    containsTuioPointer: function() {
        return !!this.pointer;
    },
    
    containsNewTuioPointer: function() {
        return this.containsTuioPointer() &&
                this.pointer.getTuioState() === Tuio.TUIO_ADDED;
    },
    
    setTuioPointer: function(pointer) {
        this.pointer = pointer;
    },
                                         
    getTuioPointer: function() {
        return this.pointer;
    },
    
    removeTuioToken: function(ttime) {
        if (this.token) {
            this.token.remove(ttime);
        }
        this.currentTime = ttime;
    },
    
    deleteTuioToken: function() {
        this.token = null;
    },
    
    containsTuioToken: function() {
        return !!this.token;
    },
    
    containsNewTuioToken: function() {
        return this.containsTuioToken() &&
                this.token.getTuioState() === Tuio.TUIO_ADDED;
    },
                                         
    getTuioToken: function() {
        return this.token;
    },
    
    setTuioToken: function(token) {
        this.token = token;
    },
    
    getSessionId: function() {
        return this.sessionId;
    },
    
    getTuioTime: function() {
        return this.currentTime;
    },
    
    getStartTime: function() {
        return this.startTime;
    },
    
    setTuioSource: function(source) {
        this.source = source;
    },
    
    getTuioSource: function() {
        return this.source;
    },
    
    getTuioState: function() {
        return this.state;
    }
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.ObjectContainer;
}
    
})(this);