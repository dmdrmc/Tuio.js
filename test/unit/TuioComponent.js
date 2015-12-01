(function() {

var Tuio = require("../../src/Tuio");
Tuio.Component = require("../../src/TuioComponent");

QUnit.module("Tuio.Component", {
    setup: function() {
    },

    teardown: function() {
    }
});

QUnit.test("constructs", function(assert) {
    
    var component = new Tuio.Component();
    QUnit.ok(component, "TuioComponent did not initialize");
});
    
})();