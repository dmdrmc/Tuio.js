(function(root) {

var Tuio = root.Tuio;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
    Tuio.Container = require("./TuioContainer");
}

Tuio.Component = Tuio.Container.extend({
    //reference to the object that contains the pointer
    container: null,
    angle: null,
    rotationSpeed: null,
    rotationAccel: null,
    
    initialize: function(params) {
        params = params || {};
        Tuio.Container.prototype.initialize.call(this, params);
        
        this.container = params.tobj;
        this.angle = params.a;
        this.rotationSpeed = params.rs || 0;
        this.rotationAccel = params.ra || 0;
    },
    
    update: function(params) {
        Tuio.Container.prototype.update.call(this, params);
        
        this.angle = params.a;
        this.rotationSpeed = params.rs;
        this.rotationAccel = params.ra;
    },

    getContainingTuioObject: function() {
        return this.container;
    },
    getSessionId: function() {
        if (typeof this.container !== "undefined") {
            return this.container.getSessionId();
        }
    },
    getAngle: function() {
        return this.angle;
    },
    getRotationSpeed: function() {
        return this.rotationSpeed;
    },
    getRotationAccel: function() {
        return this.rotationAccel;
    }
}, {
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Component;
}
    
}(this));