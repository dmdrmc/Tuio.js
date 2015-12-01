(function(root) {

var Tuio = root.Tuio;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
    Tuio.Container = require("./TuioContainer");
}

Tuio.Component = Tuio.Container.extend({
    
    initialize: function(params) {
        params = params || {};
        Tuio.Container.prototype.initialize.call(this, params);
    },
    
    update: function(params) {
        Tuio.Container.prototype.update.call(this, params);
    }
}, {
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Component;
}
    
}(this));