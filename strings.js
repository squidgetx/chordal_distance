const Midi = require("./midi");
const Util = require("./util");
const Nanotimer = require("./nanotimer");

const SCALE = [
  Midi.NOTES.A,
  Midi.NOTES.B,
  Midi.NOTES["C#"],
  Midi.NOTES["D"],
  Midi.NOTES.E,
  Midi.NOTES["F#"],
  Midi.NOTES["G#"],
];

const VIOLA_NOTES = {
  0: [Midi.NOTES.A],
};
const VIOLA_OCTAVE = 6;
const VIOLA_CHANNEL = 0;
const STRINGS_NOTES = {
  0: {
    base: [Midi.NOTES.C + 12, Midi.NOTES.A, Midi.NOTES.A],
    extensions: [Midi.NOTES.G, Midi.NOTES.B],
  },
};
const STRINGS_OCTAVE = 5;
const STRINGS_CHANNEL = 1;

function init(device, socket_) {
  socket = socket_;
  midi_device = device;
}

/*
 * each instrument has internal state that updates using the `tick` callback
 * each instrument has a separate clock that manages note output events
 *
 * Energy decays over time
 * Higher energy -> louder, harsher texture and faster playing
 * Pitches are chosen both by changes in angle and changes in
 */

// ok so one version could be that one set of angle changes
// manipulates the "circle of fifths?" and the whole thing is basically
// polyharmony based on that?

// that's kind of interesting, maybe

function tick(tension, angleX1, angleY1, angleX2, angleY2) {
  // more tension increases energy, up to a max value of 24
  // linear decay
  let viola_note = Util.index(angleX1, SCALE) + VIOLA_OCTAVE * 12;
  Midi.noteSustain(midi_device, VIOLA_CHANNEL, 0, viola_note, 80);

  let synth_note = Util.index(angleX2, SCALE) + STRINGS_OCTAVE * 12;
  Midi.noteSustain(midi_device, STRINGS_CHANNEL, 0, synth_note, 80);

  // Effects
  // Viola Control 1
  Midi.setControl(midi_device, 1, 1, Util.scale(tension, 0, 100, 1, 72));
  // Strings Control 1
  Midi.setControl(midi_device, 1, 2, Util.scale(tension, 0, 100, 48, 127));
}

module.exports = {
  tick: tick,
  init: init,
};
