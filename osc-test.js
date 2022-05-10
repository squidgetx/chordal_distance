let Noble = require("@abandonware/noble");
let Osc = require("osc");
let UUID_PRIMARY = "0b5dca24-b5ff-4d4e-923e-be8c16ae8b2e";
let UUID_SECONDARY = "05fe3c85-7f28-4685-ab2a-b036324da113";

let oscPort = new Osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 57121,
  // This is where sclang is listening for OSC messages.
  remoteAddress: "127.0.0.1",
  remotePort: 57120,
});

let oscPortReady = false;
let primaryConnected = false;
let secondaryConnected = false;

oscPort.open();
oscPort.on("error", function (error) {
  console.log("An error occurred: ", error.message);
});
oscPort.on("ready", function () {
  console.log("Osc port ready!");
  // ableton floats
  oscPortReady = true;
  setInterval(() => {
    console.log("Sent osc data");
    oscPort.send({
      address: "/primary/tension",
      args: [
        {
          type: "f",
          value: 0.5,
        },
      ],
    });
    oscPort.send({
      address: "/primary/tension2",
      args: [
        {
          type: "f",
          value: 0.25,
        },
      ],
    });
  }, 500);
});
