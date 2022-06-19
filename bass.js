const Midi = require("./midi");
const Util = require("./util");
const Nanotimer = require("./nanotimer");

const Harmony = require("./harmony");
const CHANNEL = 3;

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
  Midi.NOTES.C, // C,
  Midi.NOTES.D, // D,
  Midi.NOTES.E, // E
  Midi.NOTES.F, // F
  Midi.NOTES.G, // G
  Midi.NOTES.A, // A
  Midi.NOTES.Bb, // A
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
  let note = Harmony.makeNote(Util.index(lastAngleX2, NOTES), 2);

  let velocity = Util.scale(energy, 0, 24, 30, 100);
  let duration = 100;
  //console.log("note " + note + " " + velocity);

  if (energy > 13) {
    Midi.playNote(midi_device, CHANNEL, note, velocity, duration);
  }

  //let tvelocity = Util.clamp(Util.scale(energy, 16, 24, 0, 100), 0, 127);
  //let tnote = Harmony.makeNote(Util.index(lastAngleX2, TNOTES), octave);

  //Midi.playNote(midi_device, CHANNEL, tnote, tvelocity, duration);

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
  Midi.setControl(
    midi_device,
    CHANNEL,
    1,
    Util.scale(tension, 50, 100, 40, 127)
  );
  Midi.setControl(
    midi_device,
    CHANNEL,
    2,
    Util.scale(lastAngleY1, 0, 1, 0, 127)
  );
  // drive
  Midi.setControl(
    midi_device,
    CHANNEL,
    3,
    Util.scale(tension, 50, 100, 16, 96)
  );

  frequency = Util.clamp_scale(energy, 12, 24, 500, 1500);
}

module.exports = {
  tick: tick,
  init: init,
};
