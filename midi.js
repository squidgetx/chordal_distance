let socket;
let mute = false;

const NOTES = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

const INTERVALS = {
  unison: 0,
  min2: 1,
  maj2: 2,
  min3: 3,
  maj3: 4,
  p4: 5,
  tritone: 6,
  p5: 7,
  min6: 8,
  maj6: 9,
  min7: 10,
  maj7: 11,
  octave: 12,
};

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

const ACTIVE_VOICES = {};

let noteSustain = function (device, channel, voice, note, velocity) {
  // Sustains a note for an arbitrary channel-voice pair
  if (mute) {
    return;
  }
  let voice_key = `${channel}_${voice}`;
  // If the voice is singing something, tell it to stop before changing notes
  let current_note = ACTIVE_VOICES[voice_key];
  if (current_note == note) {
    return;
  }
  if (current_note) {
    device.send("noteoff", {
      note: current_note,
      velocity: 0,
      channel: channel,
    });
  }
  for (let i = 0; i < 5; i++) {
    device.send("noteon", {
      note: note,
      velocity: velocity,
      channel: channel,
    });
  }
  ACTIVE_VOICES[voice_key] = note;
};

let playChord = function (device, channel, notes, velocities) {
  for (let i = 0; i < notes.length; i++) {
    noteSustain(device, channel, i, notes[i], velocities[i]);
  }
};

let stopAll = function (device, channel) {
  for (let key in ACTIVE_VOICES) {
    if (key.startsWith(`${channel}_`)) {
      device.send("noteoff", {
        note: ACTIVE_VOICES[key],
        velocity: 0,
        channel: channel,
      });
      delete ACTIVE_VOICES[key];
    }
  }
};

let setControl = function (device, channel, controller, value) {
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

let set_mute = function (m) {
  mute = m;
};

module.exports = {
  playNote: playNote,
  playChord: playChord,
  noteSustain,
  noteSustain,
  setControl: setControl,
  setControlNoMute: setControlNoMute,
  socket: socket,
  set_mute: set_mute,
  NOTES: NOTES,
  INTERVALS: INTERVALS,
  stopAll,
};
