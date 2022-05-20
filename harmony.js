const Midi = require("./midi");

const ROOT = Midi.NOTES.A;
const SCALE = [
  Midi.NOTES.C,
  Midi.NOTES.D,
  Midi.NOTES.E,
  Midi.NOTES.F,
  Midi.NOTES.G,
  Midi.NOTES.A,
  Midi.NOTES.Bb,
];
const INTERVALS = [
  Midi.INTERVALS.unison,
  Midi.INTERVALS.maj2,
  Midi.INTERVALS.maj3,
  Midi.INTERVALS.p4,
  Midi.INTERVALS.p5,
  Midi.INTERVALS.maj6,
  Midi.INTERVALS.min7,
  Midi.INTERVALS.octave,
];

function makeNote(note, octave) {
  return note + octave * 12 + ROOT;
}

module.exports = {
  ROOT,
  SCALE,
  INTERVALS,
  makeNote,
};
