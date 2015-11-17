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
    
QUnit.test("keeps track of Tuio2 cursors", function(assert) {
    
    var done = assert.async(),
        server = new MockServer("test-url"),
        arrayBuffer = new ArrayBuffer(1000),
        ui8View = new Uint8Array(arrayBuffer),
        bufferView = new DataView(arrayBuffer);
    
    window.WebSocket = MockWebSocket;
    client = new Tuio.Client({  
        host: "test-url"
    });
    client.connect();
    
    /**
      * tuio2/ptr s_id tu_id c_id x_pos y_pos angle shear radius press
    ui8View[0] = "/".charCodeAt();
    ui8View[1] = "t".charCodeAt();
    ui8View[2] = "u".charCodeAt();
    ui8View[3] = "i".charCodeAt();
    ui8View[4] = "o".charCodeAt();
    ui8View[5] = "2".charCodeAt();
    ui8View[6] = "/".charCodeAt();
    ui8View[7] = "p".charCodeAt();
    ui8View[8] = "t".charCodeAt();
    ui8View[9] = "r".charCodeAt();
    ui8View[10] = 0;
    ui8View[11] = 0;
    // osc type tags start with comma
    ui8View[12] = ",".charCodeAt();
    // s_id => integer
    ui8View[13] = "i".charCodeAt();
    // tu_id
    ui8View[14] = "i".charCodeAt();
    // c_id
    ui8View[15] = "i".charCodeAt();
    // all others floats
    // x_pos
    ui8View[16] = "f".charCodeAt();
    // y_pos
    ui8View[17] = "f".charCodeAt();
    // angle
    ui8View[18] = "f".charCodeAt();
    // shear
    ui8View[19] = "f".charCodeAt();
    // radius
    ui8View[20] = "f".charCodeAt();
    // press
    ui8View[21] = "f".charCodeAt();
    ui8View[22] = 0;
    ui8View[23] = 0;
    //actual values
    //s_id => 1
    bufferView.setUint32(7, 1);
    //tu_id, two 16-bit values
    //t_id
    ui8View[28] = 0;
    ui8View[29] = 2;
    //u_id
    ui8View[30] = 0;
    ui8View[31] = 3;
    // c_id
    bufferView.setUint32(9, 4);
    // x_pos is float
    bufferView.setFloat32(10, 5);
    // y_pos
    bufferView.setFloat32(11, 6);
    // angle
    bufferView.setFloat32(12, 7);
    //shear
    bufferView.setFloat32(13, 8);
    //radius
    bufferView.setFloat32(14, 9);
    //press
    bufferView.setFloat32(15, 10);
      */
    
    ui8View[0] = "/".charCodeAt();
    ui8View[1] = "t".charCodeAt();
    ui8View[2] = "u".charCodeAt();
    ui8View[3] = "i".charCodeAt();
    ui8View[4] = "o".charCodeAt();
    ui8View[5] = "/".charCodeAt();
    ui8View[6] = "2".charCodeAt();
    ui8View[7] = "D".charCodeAt();
    ui8View[8] = "c".charCodeAt();
    ui8View[9] = "u".charCodeAt();
    ui8View[10] = "r".charCodeAt();
    ui8View[11] = 0;
    // osc type tags start with comma
    ui8View[12] = ",".charCodeAt();
    // set string
    ui8View[13] = "s".charCodeAt();
    // s_id => integer
    ui8View[14] = "i".charCodeAt();
    // x_pos => float
    ui8View[15] = "f".charCodeAt();
    // y_pos
    ui8View[16] = "f".charCodeAt();
    // x_vel
    ui8View[17] = "f".charCodeAt();
    // y_vel
    ui8View[18] = "f".charCodeAt();
    // m_accel
    ui8View[19] = "f".charCodeAt();
    ui8View[20] = 0;
    ui8View[21] = 0;
    ui8View[22] = 0;
    ui8View[23] = 0;
    //actual values
    // string set
    ui8View[24] = "s".charCodeAt();
    ui8View[25] = "e".charCodeAt();
    ui8View[26] = "t".charCodeAt();
    ui8View[27] = 0;
    //s_id => 1
    bufferView.setUint32(28, 1);
    // x_pos is float
    bufferView.setFloat32(32, 5);
    // y_pos
    bufferView.setFloat32(36, 6);
    // x_vel
    bufferView.setFloat32(40, 7);
    // y_vel
    bufferView.setFloat32(44, 8);
    // m_accel
    bufferView.setFloat32(48, 9);
    
    QUnit.equal( new Uint8Array(arrayBuffer)[0], "/".charCodeAt(), "buffer not properly set" );
    
    QUnit.equal( client.frameCursors.length, 0, "frameCursor length was not initially zero");
    // send
    setTimeout( function() {
        server.send(arrayBuffer);
        QUnit.equal( client.frameCursors.length, 1, "Tuio.Client did not recognize a cursor message");
        done();
    }, 10);
});

})();