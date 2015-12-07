# Tuio-extended.js

This is a fork of [Tuio.js](https://github.com/fe9lix/Tuio.js), the original JavaScript implementation of the TUIO protocol.

Tuio-extended.js supports a very basic subset of the [TUIO2 protocol](tuio.org/?tuio20), namely the the pointer (PTR) and token (TOK) components. They are currently not completely implemented.

Because the [reference C++](https://github.com/mkalten/TUIO20_CPP) implementation of TUIO2 supports  WebSockets on the TuioServer, Tuio-extended also has a number of other changes:

* it decodes the TUIO OSC messages using [https://github.com/colinbdclark/osc.js](osc.js), instead of using a local Node server
* the socket.io connection from the browser to a local Node server that relays the UDP messages to the browser is no longer needed
* if necessary for the original TUIO (v1) protocol, it is still available using `src/server.js`. Internally it uses the [ws package](https://github.com/websockets/ws) instead of socket.io

## License
Licensed under the GPL license.