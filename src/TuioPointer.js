(function(root) {

var Tuio = root.Tuio;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
    Tuio.Component = require("./TuioComponent");
}

Tuio.Pointer = Tuio.Component.extend({
    pointerId: null,
    typeId: null,
    userId: null,
    componentId: null,
    shear: null,
    radius: null,
    pressure: null,
    pressureSpeed: null,
    pressureAccel: null,

    initialize: function(params) {
        params = params || {};
        Tuio.Component.prototype.initialize.call(this, params);
        
        this.pointerId = params.pi;
        this.typeId = params.ti
        this.userId = params.ui;
        this.componentId = params.ci;
        this.shear = params.sa;
        this.radius = params.r;
        this.pressure = params.p;
        this.pressureSpeed = params.ps;
        this.pressureAccel = params.pa;
    },
    getPointerId: function() {
        return this.pointerId;
    },
    getTypeId: function() {
        return this.typeId;
    },
    getUserId: function() {
        return this.userId;
    },
    getComponentId: function() {
        return this.componentId;
    },
    getShear: function() {
        return this.shear;
    },
    getRadius: function() {
        return this.radius;
    },
    getPressure: function() {
        return this.pressure;
    },
    getPressureSpeed: function() {
        return this.pressureSpeed;
    },
    getPressureAccel: function() {
        return this.pressureAccel;
    },
        
    update: function(params) {
        params = params || {};
        
        Tuio.Component.prototype.update.call(this, params);
        this.shear = params.sa;
        this.radius = params.r;
        this.pressure = params.p;
        this.pressureSpeed = params.ps;
        this.pressureAccel = params.pa;
    }
}, { 
    fromPointer: function(tptr) {
        return new Tuio.Pointer({
            ti: tptr.getTypeId(),
            ui: tptr.getUserId(),
            pi: tptr.getPointerId(),
            xp: tptr.getX(),
            yp: tptr.getY(),
            ci: tptr.getComponentId(),
            a: tptr.getAngle(),
            sa: tptr.getShear(),
            r: tptr.getRadius(),
            p: tptr.getPressure(),
            tobj: tptr.getContainingTuioObject(),
        });
    }
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Pointer;
}
    
}(this));