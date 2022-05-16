const Midi = require("./midi");
const Util = require("./util");
const Nanotimer = require("./nanotimer");

const NOTES = [67, 74, 79];
const NOTE_CHANNEL = 7;
let clock = null;
let energy = 0;
let midi_device = 0;
let lastAngle = 0;
let lastTension = 0;
let frequency = 1000;
let socket = null;

function init(device, socket_) {
  socket = socket_;
  midi_device = device;
  clock = new Nanotimer();
  clock.setTimeout(playNote, "", frequency);
}

/*
 * each instrument has internal state that updates using the `tick` callback
 * each instrument has a separate clock that manages note output events
 *
 * Energy decays over time
 * Higher energy -> louder, harsher texture and faster playing
 * Pitches are chosen both by changes in angle and changes in
 */

function playNote() {
  let octave = Util.scale(energy, 0, 24, -3, -1);
  let note_index = Util.clamp_scale(lastAngle, 0, 1, 0, NOTES.length - 1);
  let note = NOTES[note_index] + octave * 12;

  let velocity = Util.scale(energy, 0, 24, 30, 100);
  let duration = 100;
  //console.log("note " + note + " " + velocity);

  Midi.playNote(midi_device, NOTE_CHANNEL, note, velocity, duration);
  clock.setTimeout(playNote, "", frequency);
}

function tick(tension, angle) {
  // more tension increases energy, up to a max value of 24
  // linear decay
  energy = Util.scale(tension, 0, 100, 0, 24);
  lastAngle = angle;
  lastTension = tension;
  socket.emit("marimba", {
    energy: energy,
    frequency: frequency,
  });

  frequency = Util.clamp(2000 / (energy + 1), 100, 5000);
}

module.exports = {
  tick: tick,
  init: init,
};
