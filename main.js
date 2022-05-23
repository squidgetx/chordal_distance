const Ble = require("./ble");
const Midi = require("./midi");
const Server = require("./server");
const Easymidi = require("easymidi");
const Nanotimer = require("./nanotimer");

const Marimba = require("./marimba");
const Strings = require("./strings");
const Vibes = require("./vibes");
const Bass = require("./bass");
const Horns = require("./horns");

let tension_GLOBAL = 0;
let angleX1_GLOBAL = 0;
let angleX2_GLOBAL = 0;
let angleY1_GLOBAL = 0;
let angleY2_GLOBAL = 0;
let master_clock_GLOBAL = null;
let calibrate_GLOBAL = false;
let status = "pause";

const midi_devices = {
  Virtual1: new Easymidi.Output("Virtual1", true),
};

const UUID_PRIMARY = "0b5dca24-b5ff-4d4e-923e-be8c16ae8b2e";
const UUID_SECONDARY = "05fe3c85-7f28-4685-ab2a-b036324da113";

/*
 * Event Architecture: values for tension, angle, etc
 * are stored in global variables. These variables are
 * updated whenever we receive Bluetooth messages
 * from the instrument hardware OR from the client web
 * application (used mostly in debugging)
 *
 * Then, an event loop controlled by MASTER_CLOCK
 * consumes these values
 */
let instruments = [Strings, Marimba, Vibes, Bass, Horns];

let tick = function () {
  // Master clock callback. All updating of state occurs here
  for (const i of instruments) {
    i.tick(
      tension_GLOBAL,
      angleX1_GLOBAL,
      angleY1_GLOBAL,
      angleX2_GLOBAL,
      angleY2_GLOBAL
    );
  }
};

let init = function (socket) {
  for (const i of instruments) {
    i.init(midi_devices.Virtual1, socket);
  }
  master_clock_GLOBAL = new Nanotimer();
  // 30hz refresh rate
  master_clock_GLOBAL.setInterval(tick, "", 1000 / 30);
  console.log("Initialized!");
};

let calibration_array = [];
let tension_coefficient = 1 / 3000;
let tension_offset = 0;

let primaryCallback = (data) => {
  let accX = data.readFloatLE();
  let accY = data.readFloatLE(4);
  let accZ = data.readFloatLE(8);
  let tension_raw = data.readFloatLE(12);
  tension_GLOBAL = Math.abs(tension_raw + tension_offset) * tension_coefficient;
  angleX1_GLOBAL = accZ;
  angleY1_GLOBAL = accY;
  io.emit("tension", tension_GLOBAL);
  io.emit("angle_x1", angleX1_GLOBAL);
  io.emit("angle_y1", angleY1_GLOBAL);
  if (calibrate_GLOBAL) {
    calibration_array.push(tension_raw);
  }
};

let secondaryCallback = (data) => {
  let accX = data.readFloatLE();
  let accY = data.readFloatLE(4);
  let accZ = data.readFloatLE(8);
  angleX1_GLOBAL = accZ;
  angleY1_GLOBAL = accY;
  io.emit("angle_x2", angleX2_GLOBAL);
  io.emit("angle_y2", angleY2_GLOBAL);
};

let io = Server.run();

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
      Midi.set_mute(true);
    } else {
      status = "pause";
      Midi.set_mute(false);
    }
    socket.emit("status", status);
  });
  socket.emit("status", status);
  socket.on("server_check", (data) => {
    socket.emit("server_ack", new Date().getTime());
  });
  socket.on("tension", (data) => {
    tension_GLOBAL = data;
  });
  socket.on("angleX1", (data) => {
    angleX1_GLOBAL = data;
  });
  socket.on("angleY1", (data) => {
    angleY1_GLOBAL = data;
  });
  socket.on("angleX2", (data) => {
    angleX2_GLOBAL = data;
  });
  socket.on("angleY2", (data) => {
    angleY2_GLOBAL = data;
  });
  socket.on("calibrate_begin", (data) => {
    calibrate_GLOBAL = true;
    calibration_array = [];
    socket.emit(
      "calibrate_message",
      "Zeroing the load sensor (5 seconds)... Please ensure no tension is placed on the handle."
    );
    // After 5 seconds, use the average data to set the zero
    setTimeout(() => {
      tension_offset =
        -calibration_array.reduce((a, b) => a + b) / calibration_array.length;
      console.log(tension_offset);
      console.log(calibration_array);
      socket.emit(
        "calibrate_message",
        "Calibrating maximum force (15 seconds). Please load the handle with the maximum expected force."
      );
      calibration_array = [];
      setTimeout(() => {
        tension_coefficient =
          100 /
          calibration_array.reduce((a, b) =>
            Math.max(Math.abs(a), Math.abs(b))
          );
        console.log(tension_coefficient);
        socket.emit("calibrate_finish");
        calibrate_GLOBAL = false;
      }, 15000);
    }, 5000);
  });

  Midi.socket = socket;
});

Ble.connect(
  [
    {
      uuid: UUID_PRIMARY,
      //id: "ea4d428e233340bb91ef1be5c710e41f",
      id: "1b34449c550b41ae80ae7cc9553e76c5",
      name: "Primary",
      characteristics: [
        {
          name: "primary",
          callback: primaryCallback,
        },
      ],
      disconnectHandler: false,
    },
    {
      uuid: UUID_PRIMARY,
      id: "a0183c83a61147ba27c081a2221b0105",
      name: "Secondary",
      characteristics: [
        {
          name: "accel",
          callback: primaryCallback,
        },
      ],
      disconnectHandler: false,
    },
  ],
  io
);

setTimeout(() => init(io), 2000);
