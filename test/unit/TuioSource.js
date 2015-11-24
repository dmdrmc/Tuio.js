(function() {

var Tuio = require("../../src/Tuio");
Tuio.Source = require("../../src/TuioSource");
    
QUnit.module("Tuio.Source", {
    setup: function() {
        
    },
    teardown: function() {
    }
});

QUnit.test("construct without params", function() {
    
    var source = new Tuio.Source();
    
    QUnit.strictEqual(source.sourceId, 0,
                    "default sourceId was not set to 0");
    QUnit.strictEqual(source.sourceName, "",
                    "default sourceName was not set to empty string");
    QUnit.strictEqual(source.sourceInstance, 0,
                    "default sourceInstance was not set to 0");
    QUnit.strictEqual(source.sourceAddress, "localhost",
                    "default sourceAdress was not set to 'localhost'");
    QUnit.strictEqual(source.dimension, 0,
                    "default dimension was not set to 0");
});

QUnit.test("construct", function() {
    
    var source = new Tuio.Source({
        sourceId: 1,
        sourceInstance: 2,
        dimension: 3,
        sourceName: "source",
        sourceAddress: "not-localhost"
    }); 
    
    QUnit.strictEqual(source.sourceId, 1,
                    "sourceId was not set to 1");
    QUnit.strictEqual(source.sourceName, "source",
                    "sourceName was not set to 'source'");
    QUnit.strictEqual(source.sourceInstance, 2,
                    "sourceInstance was not set to 2");
    QUnit.strictEqual(source.sourceAddress, "not-localhost",
                    "sourceAdress was not set to 'not-localhost'");
    QUnit.strictEqual(source.dimension, 3,
                    "dimension was not set to 3");
});

QUnit.test("construct with source string", function() {
    
    var source = new Tuio.Source({
        sourceString: "name:1@address"
    });
    
    QUnit.strictEqual(source.sourceName, "name",
                    "sourceName was not set to 'name'");
    QUnit.strictEqual(source.sourceInstance, 1,
                    "sourceInstance was not set to 1");
    QUnit.strictEqual(source.sourceAddress, "address",
                    "sourceAdress was not set to 'address'");
});

QUnit.test("construct with partial source string", function() {
    
    var source = new Tuio.Source({
        sourceString: "name"
    });
    
    QUnit.strictEqual(source.sourceName, "name",
                    "sourceName was not set to 'name'");
    QUnit.strictEqual(source.sourceInstance, 0,
                    "default sourceInstance was not set to 0");
    QUnit.strictEqual(source.sourceAddress, "localhost",
                    "default sourceAdress was not set to 'localhost'");
    
    source = new Tuio.Source({
        sourceString: "name:2"
    });
    
    QUnit.strictEqual(source.sourceName, "name",
                    "sourceName was not set to 'name'");
    QUnit.strictEqual(source.sourceInstance, 2,
                    "sourceInstance was not set to 2");
    QUnit.strictEqual(source.sourceAddress, "localhost",
                    "default sourceAdress was not set to 'localhost'");
});
    
QUnit.test("return sourceString from parameter", function() {
    
    var source = new Tuio.Source({
        sourceInstance: 2,
        sourceName: "source",
        sourceAddress: "not-localhost"
    });
    
    QUnit.strictEqual(source.getSourceString(), "source:2@not-localhost",
                        "sourceString not properly read");
});

QUnit.test("returns correct width and height from dimension", function() {
    
    var source = new Tuio.Source({
        // 640 x 480
        // 02 80 01 E0
        dimension: 41943520
    });
    
    QUnit.strictEqual(source.getWidth(), 640,
                        "source width not properly extracted from dimension");
    
    QUnit.strictEqual(source.getHeight(), 480,
                        "source height not properly extracted from dimension");
});

})();