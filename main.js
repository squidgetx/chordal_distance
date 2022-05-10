let Ble = require("./ble");
let Midi = require("./midi");
let Server = require("./server");
let Easymidi = require("easymidi");
const server = require("./server");

const midi_devices = {
  Virtual1: new Easymidi.Output("Virtual1", true),
};

let status = "pause";

const UUID_PRIMARY = "0b5dca24-b5ff-4d4e-923e-be8c16ae8b2e";
const UUID_SECONDARY = "05fe3c85-7f28-4685-ab2a-b036324da113";

let tensionCallback = () => {};
let primaryAccelCallback = () => {};
let secondaryAccelCallback = (data) => {
  accel = handleAcceleration(data);
  /* 
  Midi.playNote(
    virtualOutput,
    1,
    Math.random() * 127,
    Math.random() * 127,
    100
  );
  */
};

function handleAcceleration(data) {
  let accX = data.readFloatLE();
  let accY = data.readFloatLE(4);
  let accZ = data.readFloatLE(8);

  accMag = Math.sqrt(accX * accX + accY * accY + accZ * accZ);
  angleXZ = Math.atan2(-accX, accZ);
  return {
    accMag: accMag,
    angleXZ: angleXZ,
  };
}

let io = server.run();

io.on("connection", (socket) => {
  socket.on("list_devices", (data) => {
    io.emit("list_devices", midi_devices);
  });
  socket.on("play_cc", (data) => {
    Midi.setControlNoMute(
      midi_devices[data.device],
      data.channel,
      data.controller,
      data.value
    );
  });
  socket.on("toggle", (data) => {
    if (status == "pause") {
      status = "play";
      Midi.mute = false;
    } else {
      status = "pause";
      Midi.mute = true;
    }
    socket.emit("status", status);
  });
  socket.emit("status", status);
  Midi.socket = socket;
});

/*
Ble.connect([
  {
    uuid: UUID_PRIMARY,
    id: "test",
    name: "primary",
    characteristics: [
      {
        name: "tension",
        callback: tensionCallback,
      },
      {
        name: "accel",
        callback: primaryAccelCallback,
      },
    ],
  },
  {
    uuid: UUID_SECONDARY,
    id: "eccb8ace4f1b4a92a591ac4d5041c30e",
    name: "secondary",
    characteristics: [
      {
        name: "accel",
        callback: secondaryAccelCallback,
      },
    ],
  },
]);
*/
