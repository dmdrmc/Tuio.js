(function() {

var realWebSocket,
    serverInstance,
    clientInstance;
    
var Tuio = require("../../src/Tuio");
Tuio.Client = require("../../src/TuioClient");
var mockSocket = require("webmocket");

QUnit.module("Integration: mock-socket", {
    setup: function() {
        var connectionUrl = "test-url";
        // replace WebSocket constructor for each test
        realWebSocket = WebSocket;
        window.WebSocket = mockSocket.WebMocket;
        // setup
        serverInstance = new mockSocket.MocketServer(connectionUrl);
        clientInstance = new WebSocket(connectionUrl);
    },

    teardown: function() {
        //
        WebSocket = realWebSocket;
        // shutdown server
        serverInstance.close();
    }
});

QUnit.test("MockWebSocket and MockServer globally available in tests", function() {
    
    QUnit.ok( mockSocket.WebMocket, "mock-socket not loaded"); 
    QUnit.ok( mockSocket.MocketServer, "mock-socket server not loaded");
});

QUnit.test("Mocked WebSocket replaces WebSocket constructor", function() {
    
    QUnit.equal( mockSocket.WebMocket, WebSocket, "mock-socket didn't replace WebSocket");
});
    
QUnit.test("Mocked WebSocket has open readyState", function(assert) {
    
    var done = assert.async();
    
    setTimeout( function() {
        QUnit.equal( clientInstance.readyState, realWebSocket.OPEN, "mocked WebSocket connection not open" );
        done();
    }, 10);
});

QUnit.test("Mocked WebSocket can receive messages from MockServer", function(assert) {
    
    clientInstance.onmessage = function(event) {
        QUnit.equal(event.data, 1, "received message not the right one");
    };
    
    serverInstance.send(1);
    serverInstance.close();
});

QUnit.test("Mocked WebSocket can receive ArrayBuffer data", function() {
    
    var binaryDataBuffer = new ArrayBuffer(1),
        binaryDataArray = new Uint8Array(binaryDataBuffer);
    
    clientInstance.onmessage = function(event) {
        var data = new Uint8Array(event.data);
        QUnit.equal( data[0], 1, "didn't receive the right data" );
    };
    
    binaryDataArray[0] = 1;
    serverInstance.send(binaryDataBuffer);
});
    
QUnit.test("Tuio.Client/oscReceiver instantiates a mocked WebSocket", function() {
    
    var client = new Tuio.Client({
        host: "test-url"
    });
    
    client.connect();
    
    QUnit.ok( client.oscReceiver.socket instanceof mockSocket.WebMocket );
});
    
})();
