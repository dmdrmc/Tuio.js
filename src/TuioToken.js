(function(root) {

var Tuio = root.Tuio;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
    Tuio.Component = require("./TuioComponent");
}

Tuio.Token = Tuio.Component.extend({
    symbolId: null,
    typeId: null,
    userId: null,
    
    initialize: function(params) {
        params = params || {};
        Tuio.Component.prototype.initialize.call(this, params);
        
        this.symbolId = params.sym;
        this.typeId = params.ti;
        this.userId = params.ui;
    },
    
    getSymbolId: function() {
        return this.symbolId;
    },
    getTypeId: function() {
        return this.typeId;
    },
    getUserId: function() {
        return this.userId;
    },
}, { 
    fromToken: function(ttok) {
        return new Tuio.Token({
            ti: ttok.getTypeId(),
            ui: ttok.getUserId(),
            sym: ttok.getSymbolId(),
            xp: ttok.getX(),
            yp: ttok.getY(),
            rs: ttok.getRotationSpeed(),
            ra: ttok.getRotationAccel(),
            tobj: ttok.getContainingTuioObject(),
            a: ttok.getAngle(),
        });
    }
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Token;
}
    
}(this));