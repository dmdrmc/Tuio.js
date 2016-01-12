var tuio = (function() {
    var dgram = require("dgram"),
    WebSocketServer = require('ws').Server,
    server = null,
    udpSocket = null,
    webSocketClients = [],

    init = function(params) {
        udpSocket = dgram.createSocket("udp4");
        udpSocket.on("listening", onSocketListening);
        udpSocket.bind(params.oscPort, params.oscHost);
        udpSocket.on("message", function(msg) {
            webSocketClients.forEach(function(webSocket) {
                if ( webSocket.readyState === webSocket.OPEN ) {
                    webSocket.send(msg, function onWebSocketSendError(error) {
                        if (typeof error !== "undefined") {
                            console.log(error);
                        }
                    });   
                }
            });
        }),
        
        server = new WebSocketServer({
            port: params.socketPort
        });
        
        server.on("connection", onSocketConnection);
    },

    onSocketListening = function() {
        var address = udpSocket.address();
        console.log("TuioServer listening on: " + address.address + ":" + address.port);
    },

    onSocketConnection = function(webSocket) {
        webSocketClients.push(webSocket);
        console.log("Websocket client connected");
        webSocket.on("close", function() {
            var indexOf = webSocketClients.indexOf(webSocket);
            webSocketClients.splice(indexOf, 1);
            console.log("Websocket client disconnected");
        });
    };

    return {
        init: init
    };
}());

tuio.init({
	oscPort: 3333,
	oscHost: "0.0.0.0",
	socketPort: 8080
});
