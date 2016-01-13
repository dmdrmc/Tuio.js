[![Build Status](https://travis-ci.org/nomve/Tuio.js.svg?branch=master)](https://travis-ci.org/nomve/Tuio.js)

# Tuio-extended.js

This is a fork of [Tuio.js](https://github.com/fe9lix/Tuio.js), the original JavaScript implementation of the TUIO protocol.

Tuio-extended.js supports a very basic subset of the [TUIO2 protocol](tuio.org/?tuio20), namely the the pointer (PTR) and token (TOK) components. They are currently not completely implemented.

Because the [reference C++](https://github.com/mkalten/TUIO20_CPP) implementation of TUIO2 supports  WebSockets on the TuioServer, Tuio-extended also has a number of other changes:

* it decodes the TUIO OSC messages using [osc.js](https://github.com/colinbdclark/osc.js), instead of using a local Node server
* the socket.io connection from the browser to a local Node server that relays the UDP messages to the browser is no longer needed
* if necessary for the original TUIO (v1) protocol, the Node Server is still available using `src/server.js`. Internally it uses the [ws package](https://github.com/websockets/ws) instead of socket.io. Run it with: `node src/server.js`. It listens to `localhost:3333` for Tuio messages over UDP, and sends over `localhost:5000` for WebSocket connections.

## Usage with Tuio2
The usage is the same as in [the original library](https://github.com/fe9lix/Tuio.js), but it offers two new methods in `TuioClient` for retrieving the two new input types. The one significant difference is that they give an array of pointer of token objects, instead of a JavaScript object. For instance:
```
var client = new TuioClient({host: 'ws://connection'});

client.on('refresh', function() {
  var pointers = client.getTuioPointers();
  var tokens = client.getTuioTokens();
  // they can be iterated
  pointers.forEach(...);
  tokens.forEach(...);
});
```

## License
Licensed under the GPL license.
