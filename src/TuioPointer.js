(function(root) {

var Tuio = root.Tuio;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
    Tuio.Container = require("./TuioContainer");
}

Tuio.Pointer = Tuio.Container.extend({
    pointerId: null,
    typeId: null,
    userId: null,
    componentId: null,
    angle: null,
    shear: null,
    radius: null,
    pressure: null,

    initialize: function(params) {
        Tuio.Container.prototype.initialize.call(this, params);

        this.pointerId = params.pi;
        this.typeId = params.ti
        this.userId = params.ui;
        this.componentId = params.ci;
        this.angle = params.a;
        this.shear = params.sa;
        this.radius = params.r;
        this.pressure = params.p;
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
    getAngle: function() {
        return this.angle;
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
    setTypeUserId: function(tu_id) {
        var arrayBuffer = new ArrayBuffer(4),
            bufferView = new DataView(arrayBuffer);
        
        bufferView.setUint32(0, tu_id);
        this.typeId = bufferView.getUint16(0);
        this.userId = bufferView.getUint16(2);
    }
}, { 
    fromPointer: function(tptr) {
        return new Tuio.Pointer({
            si: tptr.getSessionId(),
            ti: tptr.getTypeId(),
            ui: tptr.getUserId(),
            pi: tptr.getPointerId(),
            xp: tptr.getX(),
            yp: tptr.getY(),
            ci: tptr.getComponentId(),
            a: tptr.getAngle(),
            sa: tptr.getShear(),
            r: tptr.getRadius(),
            p: tptr.getPressure()
        });
    }
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Pointer;
}
    
}(this));