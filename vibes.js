const Midi = require("./midi");
const Util = require("./util");
const Nanotimer = require("./nanotimer");

const Harmony = require("./harmony");
const CHANNEL = 2;

let clock = null;
let energy = 0;
let midi_device = 0;
let lastAngleX1 = 0;
let lastAngleX2 = 0;
let lastAngleY1 = 0;
let lastAngleY2 = 0;
let lastTension = 0;
let frequency = 1000;
let socket = null;

function init(device, socket_) {
  socket = socket_;
  midi_device = device;
  clock = new Nanotimer();
  clock.setTimeout(playNote, "", frequency);
}

const NOTES = [
  Midi.NOTES.D, // C,
  Midi.NOTES.A, // D,
  Midi.NOTES.A, // E
  Midi.NOTES.A, // F
  Midi.NOTES.D, // G
  Midi.NOTES.D, // A
  Midi.NOTES.D, // A
];

const TNOTES = [
  Midi.NOTES["F#"], // C,
  Midi.NOTES.C, // D,
  Midi.NOTES.G, // E
  Midi.NOTES.G, // F
  Midi.NOTES["F#"], // G
  Midi.NOTES["F#"], // A
  Midi.NOTES.F, // A
];
// Harmonically, the marimba could: underscore the existing harmony
// or, add new color

function playNote() {
  let octave = Math.floor(Util.scale(energy, 0, 24, 3, 4));
  let note = Harmony.makeNote(Util.index(lastAngleX2, NOTES), octave);

  let velocity = Util.scale(energy, 0, 24, 30, 100);
  let duration = 100;
  //console.log("note " + note + " " + velocity);

  let tvelocity = Util.clamp(Util.scale(energy, 0, 24, 0, 72), 0, 127);
  let tnote = Harmony.makeNote(Util.index(lastAngleX1, TNOTES), octave);

  frequency = Util.clamp(6000 / (energy + 1) + 100, 100, 5000);
  let delay = Util.scale(lastAngleY1, 0, 1, 0, frequency);
  if (energy > 0) {
    Midi.playNote(midi_device, CHANNEL, note, velocity, duration);
    setTimeout(
      () => Midi.playNote(midi_device, CHANNEL, tnote, tvelocity, duration),
      0
    );
  }

  clock.setTimeout(playNote, "", frequency);
}

function tick(tension, angleX1, angleY1, angleX2, angleY2) {
  // more tension increases energy, up to a max value of 24
  // linear decay
  lastAngleX1 = angleX1;
  lastAngleX2 = angleX2;
  lastAngleY1 = angleY1;
  lastAngleY2 = angleY2;
  lastTension = tension;
  energy = Util.clamp_scale(tension, 20, 100, 0, 24);
  if (energy > 12) {
    Midi.setControl(
      midi_device,
      CHANNEL,
      1,
      Util.scale(energy, 12, 24, 72, 36)
    );
  } else {
    Midi.setControl(midi_device, CHANNEL, 1, Util.scale(energy, 0, 12, 36, 72));
  }
  Midi.setControl(
    midi_device,
    CHANNEL,
    2,
    Util.scale(lastAngleY2, 0, 1, 0, 127)
  );
}

module.exports = {
  tick: tick,
  init: init,
};
