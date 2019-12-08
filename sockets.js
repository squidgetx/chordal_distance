var WebSocket = require("ws");
let Max = require("max-api");

// Listen for Web Socket requests.
var wss = new WebSocket.Server({
    port: 12345
});

// Listen for Web Socket connections.
wss.on("connection", function (socket) {
	console.log("connected");
		//console.log("received: %s", message);
	socket.on("message", function (message) {
    message = message.split(",").map(n => Number(n));
		Max.outlet(message)
	});
});
