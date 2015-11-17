(function() {

var Tuio = require("../../src/Tuio");
Tuio.Client = require("../../src/TuioClient");
var client;

QUnit.module("Tuio.Client", {
    setup: function() {
        client = new Tuio.Client({
            host: "http://localhost:5000"
        });
    },

    teardown: function() {

    }
});

QUnit.test("construct", function() {

    QUnit.equal(client.host, "http://localhost:5000");
});

QUnit.test("triggers refresh", function() {
    
    client.on("refresh", function(data) {
        QUnit.equal(data, 1, "event data is not equal");
    });
    
    client.trigger("refresh", 1);
});

})();