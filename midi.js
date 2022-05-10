let socket;
let mute = true;

let playNote = function (device, channel, note, velocity, duration) {
  if (mute) {
    return;
  }
  device.send("noteon", {
    note: note,
    velocity: velocity,
    channel: channel,
  });
  setTimeout(() => {
    device.send(
      "noteoff",
      {
        note: note,
        velocity: 0,
        channel: channel,
      },
      duration
    );
  });
};

let setControl = function (device, channel, controller, value) {
  socket.emit("cc", {
    controller: controller,
    value: value,
    channel: channel,
  });
  if (mute) {
    return;
  }
  setControlNoMute(device, channel, controller, value);
};

let setControlNoMute = function (device, channel, controller, value) {
  device.send("cc", {
    controller: controller,
    value: Math.floor(value),
    channel: channel,
  });
};

module.exports = {
  playNote: playNote,
  setControl: setControl,
  setControlNoMute: setControlNoMute,
  socket: socket,
  mute: mute,
};
