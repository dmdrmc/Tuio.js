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
    
    initialize: function(params) {
        params = params || {};
        Tuio.Container.prototype.initialize.call(this, params);
        
        this.container = params.tobj;
        this.angle = params.a;
    },
    
    update: function(params) {
        Tuio.Container.prototype.update.call(this, params);
        
        this.angle = params.a;
    },

    getSessionId: function() {
        if (typeof this.container !== "undefined") {
            return this.container.getSessionId();
        }
    },
    getAngle: function() {
        return this.angle;
    },
}, {
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Component;
}
    
}(this));