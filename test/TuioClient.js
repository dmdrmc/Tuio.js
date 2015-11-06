var Tuio = require("../src/Tuio");
Tuio.Client = require("../src/TuioClient");

QUnit.module("Tuio.Client", {
    setup: function() {

    },

    teardown: function() {

    }
});

test("construct", function() {
    var client = new Tuio.Client({
        host: "http://localhost:5000"
    });

    QUnit.equal(client.host, "http://localhost:5000");
});