(function() {

var realWebSocket,
    serverInstance,
    clientInstance;

QUnit.module("Integration: mock-socket", {
    setup: function() {
        // replace WebSocket constructor for each test
        realWebSocket = WebSocket;
        WebSocket = MockWebSocket;
        // setup
        serverInstance = new MockServer("test-url");
        clientInstance = new WebSocket("test-url");
    },

    teardown: function() {
        //
        WebSocket = realWebSocket;
        // shutdown server
        serverInstance.close();
    }
});

QUnit.test("MockWebSocket and MockServer globally available in tests", function() {
    
    QUnit.ok( MockWebSocket, "mock-socket not loaded"); 
    QUnit.ok( MockServer, "mock-socket server not loaded");
});

QUnit.test("MockSocket replaces WebSocket constructor", function() {
    
    QUnit.equal( MockWebSocket, WebSocket, "mock-socket didn't replace WebSocket");
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
    
})();