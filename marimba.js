const Midi = require("./midi");
const Util = require("./util");
const Nanotimer = require("./nanotimer");

const Harmony = require("./harmony");
const CHANNEL = 7;

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
  Midi.NOTES.G, // C,
  Midi.NOTES.G, // D,
  Midi.NOTES.G, // E
  Midi.NOTES.G, // F
  Midi.NOTES.A, // G
  Midi.NOTES.A, // A
  Midi.NOTES.A, // A
];

// Harmonically, the marimba could: underscore the existing harmony
// or, add new color

function playNote() {
  let octave = Math.floor(Util.clamp_scale(energy, 6, 24, 2, 4));
  let note = Harmony.makeNote(Util.index(lastAngleX1, NOTES), octave);

  let velocity = Util.scale(energy, 0, 24, 30, 100);
  let duration = 100;
  //console.log("note " + note + " " + velocity);

  Midi.playNote(midi_device, CHANNEL, note, velocity, duration);

  clock.setTimeout(playNote, "", frequency);
}

function tick(tension, angleX1, angleY1, angleX2, angleY2) {
  // more tension increases energy, up to a max value of 24
  // linear decay
  energy = Util.scale(tension, 0, 100, 0, 24);
  lastAngleX1 = angleX1;
  lastAngleX2 = angleX2;
  lastAngleY1 = angleY1;
  lastAngleY2 = angleY2;
  lastTension = tension;
  Midi.setControl(midi_device, CHANNEL, 1, Util.scale(tension, 0, 100, 127, 1));
  Midi.setControl(
    midi_device,
    CHANNEL,
    2,
    Util.scale(lastAngleY1, 0, 1, 1, 127)
  );

  frequency = Util.clamp(2000 / (energy + 1), 100, 5000);
}

module.exports = {
  tick: tick,
  init: init,
};
