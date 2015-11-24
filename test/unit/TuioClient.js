(function() {

var Tuio = require("../../src/Tuio");
Tuio.Client = require("../../src/TuioClient");
var client,
    server,
    osc = require("osc/dist/osc-browser");;
    
function writeOscMessage(address, args) {
    
    var arrayBuffer = new ArrayBuffer(1000),
        bufferView = new DataView(arrayBuffer),
        index = 0,
        args = args || [];
    
    function writeString(characters) {
        var ui8View = new Uint8Array(arrayBuffer);
        
        for (var i = 0; i < characters.length; i+=1) {
            ui8View[index] = characters[i].charCodeAt();
            index += 1;
        }
        //null delimiter
        ui8View[index] = 0;
        index += 1;
        // Round to the nearest 4-byte block. //osc.js
        index = (index + 3) & ~0x03;
    }
    
    // write address
    writeString(address);
    
    if (args.length !== 0) {
        
        var typeTags = args.map(function(arg){
            return arg.type;
        });
        typeTags.unshift(",");
        writeString(typeTags.join(""));
        
        for( var i = 0; i < args.length; i += 1) {
            var type = args[i].type,
                value = args[i].value,
                time;
            
            switch(type) {
                case "s":
                    writeString(value);
                    break;
                case "i":
                    bufferView.setUint32(index, value);
                    index += 4;
                    break;
                case "f":
                    bufferView.setFloat32(index, value);
                    index += 4;
                    break;
                case "t":
                    time = osc.writeTimeTag({native: value});
                    time.forEach(function(byte) {
                        bufferView.setUint8(index, byte);
                        index += 1; 
                    });
            }
        }
    }
    
    return arrayBuffer;
}
    
function getExamplePointerBuffer(params) {
    params = params || {};
    var sessionId = params.sessionId || 1;
    
    return writeOscMessage("/tuio2/ptr", [
        //session id
        {type: "i", value: sessionId},
        //tu_id, two 16-bit values
        //t_id => 15, u_id => 7
        // 0x00 0x0f 0x00 0x07 => big endian 983047
        {type: "i", value: 983047},
        // component id
        {type: "i", value: 4},
        // x_pos
        {type: "f", value: 5},
        // y_pos
        {type: "f", value: 6},
        // angle
        {type: "f", value: 7},
        // shear
        {type: "f", value: 8},
        // radius
        {type: "f", value: 9},
        // pressure
        {type: "f", value: 10},
    ]);
}
    
function assertExamplePointer(pointerInstance, params) {
    params = params || {};
    var sessionId = params.sessionId || 1;
    
    QUnit.equal(pointerInstance.getPointerId(), -1);
    QUnit.equal(pointerInstance.getTypeId(), 15);
    QUnit.equal(pointerInstance.getUserId(), 7);
    QUnit.equal(pointerInstance.getSessionId(), sessionId,
                    "sessionId of the pointer does not match");
    QUnit.equal(pointerInstance.getX(), 5);
    QUnit.equal(pointerInstance.getY(), 6);
    QUnit.equal(pointerInstance.getAngle(), 7);
    QUnit.equal(pointerInstance.getShear(), 8);
    QUnit.equal(pointerInstance.getRadius(), 9);
    QUnit.equal(pointerInstance.getPressure(), 10);
}

QUnit.module("Tuio.Client", {
    setup: function() {
        window.WebSocket = MockWebSocket;
        client = new Tuio.Client({
            host: "test-url"
        });
        server = new MockServer("test-url"); 
    },

    teardown: function() {
        server.close();
    }
});

QUnit.test("construct", function() {

    QUnit.equal(client.host, "test-url");
});

QUnit.test("triggers refresh", function() {
    
    client.on("refresh", function(data) {
        QUnit.equal(data, 1, "event data is not equal");
    });
    
    client.trigger("refresh", 1);
});
    
QUnit.test("writeOscMessage functions writes correct data", function() {
    var arrayBuffer = writeOscMessage("/tuio/2Dcur", [
        {type: "s", value: "set"},
        {type: "i", value: 1},
        {type: "f", value: 5},
        {type: "f", value: 6},
        {type: "f", value: 7},
        {type: "f", value: 8},
        {type: "f", value: 9},
    ]),
        bufferView = new DataView(arrayBuffer);
    
    QUnit.equal( bufferView.getUint8(0), "/".charCodeAt());
    QUnit.equal( bufferView.getUint8(1), "t".charCodeAt());
    QUnit.equal( bufferView.getUint8(2), "u".charCodeAt());
    QUnit.equal( bufferView.getUint8(3), "i".charCodeAt());
    QUnit.equal( bufferView.getUint8(4), "o".charCodeAt());
    QUnit.equal( bufferView.getUint8(5), "/".charCodeAt());
    QUnit.equal( bufferView.getUint8(6), "2".charCodeAt());
    QUnit.equal( bufferView.getUint8(7), "D".charCodeAt());
    QUnit.equal( bufferView.getUint8(8), "c".charCodeAt());
    QUnit.equal( bufferView.getUint8(9), "u".charCodeAt());
    QUnit.equal( bufferView.getUint8(10), "r".charCodeAt());
    QUnit.equal( bufferView.getUint8(11), 0);
    QUnit.equal( bufferView.getUint8(12), ",".charCodeAt());
    QUnit.equal( bufferView.getUint8(13), "s".charCodeAt());
    QUnit.equal( bufferView.getUint8(14), "i".charCodeAt());
    QUnit.equal( bufferView.getUint8(15), "f".charCodeAt());
    QUnit.equal( bufferView.getUint8(16), "f".charCodeAt());
    QUnit.equal( bufferView.getUint8(17), "f".charCodeAt());
    QUnit.equal( bufferView.getUint8(18), "f".charCodeAt());
    QUnit.equal( bufferView.getUint8(19), "f".charCodeAt());
    QUnit.equal( bufferView.getUint8(20), 0);
    QUnit.equal( bufferView.getUint8(21), 0);
    QUnit.equal( bufferView.getUint8(22), 0);
    QUnit.equal( bufferView.getUint8(23), 0);
    QUnit.equal( bufferView.getUint8(24), "s".charCodeAt());
    QUnit.equal( bufferView.getUint8(25), "e".charCodeAt());
    QUnit.equal( bufferView.getUint8(26), "t".charCodeAt());
    QUnit.equal( bufferView.getUint8(27), 0); 
    QUnit.equal( bufferView.getUint32(28), 1);
    QUnit.equal( bufferView.getFloat32(32), 5);
    QUnit.equal( bufferView.getFloat32(36), 6);
    QUnit.equal( bufferView.getFloat32(40), 7);
    QUnit.equal( bufferView.getFloat32(44), 8);
    QUnit.equal( bufferView.getFloat32(48), 9);
});
    
QUnit.test("keeps track of Tuio1 cursors", function(assert) {
    
    var asyncDone = assert.async(),
        arrayBuffer;
    
    client.connect();
    
    arrayBuffer = writeOscMessage("/tuio/2Dcur", [
        {type: "s", value: "set"},
        {type: "i", value: 1},
        {type: "f", value: 5},
        {type: "f", value: 6},
        {type: "f", value: 7},
        {type: "f", value: 8},
        {type: "f", value: 9},
    ]);
    
    QUnit.equal( client.frameCursors.length, 0,
                    "frameCursor length was not initially zero");
    // send
    setTimeout( function() {
        server.send(arrayBuffer);
        QUnit.equal(client.frameCursors.length, 1,
                    "Tuio.Client did not recognize a cursor message");
        QUnit.equal(client.frameCursors[0].sessionId, 1);
        QUnit.equal(client.frameCursors[0].xPos, 5);
        QUnit.equal(client.frameCursors[0].yPos, 6);
        // new cursors apparently get set without speed info
        QUnit.equal(client.frameCursors[0].xSpeed, 0);
        QUnit.equal(client.frameCursors[0].ySpeed, 0);
        asyncDone();
    }, 10);
});
    
QUnit.test("keeps track of Tuio2 pointers on the current frame", function(assert) {
    
    var asyncDone = assert.async(),
        arrayBuffer,
        pointerInstance;
    
    client.connect();
    
    arrayBuffer = getExamplePointerBuffer();
    
    QUnit.equal(client.getFramePointers().length, 0,
                "frameCursor length was not initially zero");
    
    setTimeout( function() {
        server.send(arrayBuffer);
        //check if anything in the framecursors array
        QUnit.equal(client.getFramePointers().length, 1, "Tuio.Client did not recognize a pointer message")
        //check the actual content
        assertExamplePointer(client.getFramePointers()[0]);
        asyncDone();
    }, 10);
});

QUnit.test("stores a source from the frame message", function(assert) {
    
    var asyncDone = assert.async(),
        time = new Date().getTime(),
        frameMessageBuffer;
    
    client.connect();
    
    frameMessageBuffer = writeOscMessage("/tuio2/frm", [
        // frame id
        {type: "i", value: 1},
        // time
        {type: "t", value: time},
        // dimension 640x480
        {type: "i", value: 41943520},
        // source string
        {type: "s", value: "name:1@address"}
    ]);
    
    QUnit.strictEqual(Object.keys(client.sourceList).length, 0,
                    "sourceList was undefined or not empty");
    
    setTimeout(function(){
        server.send(frameMessageBuffer);
        QUnit.strictEqual(Object.keys(client.sourceList).length, 1,
                            "source not added to the source list");
        QUnit.strictEqual(Object.keys(client.sourceList)[0], "name:1@address",
                            "source added with the wrong key");
        // resend
        server.send(frameMessageBuffer);
        QUnit.notStrictEqual(Object.keys(client.sourceList).length, 2,
                            "same source added twice");
        QUnit.strictEqual(Object.keys(client.sourceList).length, 1,
                            "source list length not 1");
        asyncDone();
    }, 10);
});

QUnit.test("updates source frame time on new frame", function(assert) {
    
    var asyncDone = assert.async(),
        time = new Date().getTime(),
        frameMessageBuffer;
    
    client.connect();
    
    frameMessageBuffer = writeOscMessage("/tuio2/frm", [
        // frame id
        {type: "i", value: 1},
        // time
        {type: "t", value: time},
        // dimension 640x480
        {type: "i", value: 41943520},
        // source string
        {type: "s", value: "name:1@address"}
    ]);
    
    setTimeout(function(){
        server.send(frameMessageBuffer);
        QUnit.strictEqual(client.sourceList["name:1@address"].getFrameTime().getSeconds(), 
                            time,
                            "time on the source not properly set");
        
        asyncDone();
    }, 10);
});

QUnit.test("makes a check for late frames", function(assert) {
    
    var asyncDone = assert.async(),
        time = new Date().getTime(),
        frameMessageBuffer;
    
    client.connect();
    
    frameMessageBuffer = writeOscMessage("/tuio2/frm", [
        // frame id
        {type: "i", value: 2},
        // time
        {type: "t", value: time},
        // dimension 640x480
        {type: "i", value: 41943520},
        // source string
        {type: "s", value: "name:1@address"}
    ]);
    
    lateFrameMessageBuffer = writeOscMessage("/tuio2/frm", [
        // frame id
        {type: "i", value: 1},
        // time
        {type: "t", value: time},
        // dimension 640x480
        {type: "i", value: 41943520},
        // source string
        {type: "s", value: "name:1@address"}
    ]);
    
    setTimeout(function(){
        server.send(frameMessageBuffer);
        QUnit.notOk(client.lateFrame, "late frame set when it shouldn't be");
        server.send(lateFrameMessageBuffer);
        QUnit.ok(client.lateFrame, "late frame check not set");
        asyncDone();
    }, 10);
});

QUnit.test("makes NO check for late frames if they are very late", function(assert) {
    
    var asyncDone = assert.async(),
        time = new Date().getTime(),
        // very late more than 1s
        time2 = new Date(time+2).getTime(),
        frameMessageBuffer;
    
    client.connect();
    
    frameMessageBuffer = writeOscMessage("/tuio2/frm", [
        // frame id
        {type: "i", value: 2},
        // time
        {type: "t", value: time},
        // dimension 640x480
        {type: "i", value: 41943520},
        // source string
        {type: "s", value: "name:1@address"}
    ]);
    
    lateFrameMessageBuffer = writeOscMessage("/tuio2/frm", [
        // frame id
        {type: "i", value: 1},
        // time
        {type: "t", value: time2},
        // dimension 640x480
        {type: "i", value: 41943520},
        // source string
        {type: "s", value: "name:1@address"}
    ]);
    
    setTimeout(function(){
        server.send(frameMessageBuffer);
        QUnit.notOk(client.lateFrame, "late frame set when it shouldn't be");
        server.send(lateFrameMessageBuffer);
        QUnit.notOk(client.lateFrame, "late frame set when it shouldn't be because of timediff");
        asyncDone();
    }, 10);
});

QUnit.test("makes NO check for late frames if frame ID reserved 0", function(assert) {
    
    var asyncDone = assert.async(),
        time = new Date().getTime(),
        time2 = new Date(time).getTime(),
        frameMessageBuffer;
    
    client.connect();
    
    frameMessageBuffer = writeOscMessage("/tuio2/frm", [
        // frame id
        {type: "i", value: 2},
        // time
        {type: "t", value: time},
        // dimension 640x480
        {type: "i", value: 41943520},
        // source string
        {type: "s", value: "name:1@address"}
    ]);
    
    lateFrameMessageBuffer = writeOscMessage("/tuio2/frm", [
        // frame id
        {type: "i", value: 0},
        // time
        {type: "t", value: time2},
        // dimension 640x480
        {type: "i", value: 41943520},
        // source string
        {type: "s", value: "name:1@address"}
    ]);
    
    setTimeout(function(){
        server.send(frameMessageBuffer);
        QUnit.notOk(client.lateFrame, "late frame set when it shouldn't be");
        server.send(lateFrameMessageBuffer);
        QUnit.notOk(client.lateFrame,
                        "late frame set when it shouldn't be because of default frame id");
        asyncDone();
    }, 10);
});
    
QUnit.test("keeps track of one alive Tuio2 session", function(assert) {
    
    var asyncDone = assert.async(),
        aliveSessionsBuffer;
    
    client.connect();
    
    aliveSessionsBuffer = writeOscMessage("/tuio2/alv", [
        {type: "i", value: 1},
    ]);
    
    QUnit.equal(client.getAliveComponents().length, 0,
                "alive session not initialized or not empty");
    
    setTimeout(function() {
        server.send(aliveSessionsBuffer);
    
        QUnit.equal(client.getAliveComponents().length, 1,
                    "alive session does not contain one item");
        QUnit.equal(client.getAliveComponents()[0], 1,
                    "alive session has the wrong session id");
        
        asyncDone();
    }, 10);
});
    
QUnit.test("keeps track of multiple alive Tuio2 sessions", function(assert) {
    
    var asyncDone = assert.async(),
        aliveSessionsBuffer;
    
    client.connect();
    
    aliveSessionsBuffer = writeOscMessage("/tuio2/alv", [
        {type: "i", value: 1},
        {type: "i", value: 3},
        {type: "i", value: 2},
    ]);
    
    QUnit.equal(client.getAliveComponents().length, 0,
                "alive session not initialized or not empty");
    
    setTimeout(function() {
        server.send(aliveSessionsBuffer);
    
        QUnit.equal(client.getAliveComponents().length, 3,
                    "alive session does not contain three items");
        QUnit.equal(client.getAliveComponents()[0], 1,
                    "alive session has the wrong session id");
        QUnit.equal(client.getAliveComponents()[1], 3,
                    "alive session has the wrong session id");
        QUnit.equal(client.getAliveComponents()[2], 2,
                    "alive session has the wrong session id");
        
        asyncDone();
    }, 10);
});
    
QUnit.test("uses only the last alive message to store active sessions", function(assert) {
    
    var asyncDone = assert.async(),
        aliveSessionsBuffer;
    
    client.connect();
    
    aliveSessionsBuffer = writeOscMessage("/tuio2/alv", [
        {type: "i", value: 1},
    ]);
    
    QUnit.equal(client.getAliveComponents().length, 0,
                "alive session not initialized or not empty");
    
    setTimeout(function() {
        server.send(aliveSessionsBuffer);
        QUnit.equal(client.getAliveComponents().length, 1,
                    "alive session does not contain one item");
        server.send(aliveSessionsBuffer);
        QUnit.equal(client.getAliveComponents().length, 1,
                    "alive session does not contain one item");
        asyncDone();
    }, 10);
});
    
QUnit.test("adds pointer to active list when pointer alive", function(assert) {
    
    var asyncDone = assert.async(),
        pointerBuffer,
        aliveSessionsBuffer,
        pointerInstance;
    
    client.connect();
    
    pointerBuffer = getExamplePointerBuffer();    
    aliveSessionsBuffer = writeOscMessage("/tuio2/alv", [
        {type: "i", value: 1},
    ]);
    
    setTimeout(function(){
        server.send(pointerBuffer);
        QUnit.equal(client.getTuioPointers().length, 0,
                "list of active pointers is not empty");
        server.send(aliveSessionsBuffer);
        QUnit.equal(client.getTuioPointers().length, 1,
                    "current pointer not added to the active list");
        
        assertExamplePointer(client.getTuioPointers()[0]);
        asyncDone();
    }, 10);
});
    
QUnit.test("adds multiple pointers to active list sequentially", function(assert) {
    
    var asyncDone = assert.async(),
        pointerBuffer,
        aliveSessionsBuffer,
        pointerInstance;
    
    client.connect();
    
    pointerBuffer = getExamplePointerBuffer();    
    aliveSessionsBuffer = writeOscMessage("/tuio2/alv", [
        {type: "i", value: 1},
    ]);
    
    setTimeout(function(){
        server.send(pointerBuffer);
        server.send(aliveSessionsBuffer);
        // add second pointer
        pointerBuffer = getExamplePointerBuffer({
            sessionId: 2
        });
        aliveSessionsBuffer = writeOscMessage("/tuio2/alv", [
            {type: "i", value: 1},
            {type: "i", value: 2},
        ]);
        server.send(pointerBuffer);
        server.send(aliveSessionsBuffer);
        // test
        QUnit.equal(client.getTuioPointers().length, 2,
                "there should currently be 2 active pointers");
        assertExamplePointer(client.getTuioPointers()[0]);
        assertExamplePointer(client.getTuioPointers()[1], {
            sessionId: 2
        });
        asyncDone();
    }, 10);
});

})();