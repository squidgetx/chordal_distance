const Midi = require("./midi");
const Util = require("./util");
const Harmony = require("./harmony");

const VIOLA_OCTAVE = 6;
const VIOLA_CHANNEL = 0;

const STRINGS_OCTAVE = 5;
const STRINGS_CHANNEL = 1;

function init(device, socket_) {
  socket = socket_;
  midi_device = device;
}

function tick(tension, angleX1, angleY1, angleX2, angleY2) {
  // more tension increases energy, up to a max value of 24
  // linear decay
  let viola_root = Harmony.makeNote(
    Util.index(angleX1, [
      Midi.NOTES.C,
      Midi.NOTES.D,
      Midi.NOTES.F,
      Midi.NOTES.G,
    ]),
    VIOLA_OCTAVE
  );
  let viola_second = Util.index(angleY1, Harmony.INTERVALS) + viola_root;
  Midi.playChord(
    midi_device,
    VIOLA_CHANNEL,
    [viola_root, viola_root],
    [80, 80]
  );

  let synth_note = Harmony.makeNote(
    Util.index(angleX2, Harmony.SCALE),
    STRINGS_OCTAVE
  );
  let synth_second = Util.index(angleY2, Harmony.INTERVALS) + synth_note;
  Midi.playChord(
    midi_device,
    STRINGS_CHANNEL,
    [synth_note, synth_second],
    [80, 80]
  );

  // Effects
  // Viola Control 1
  Midi.setControl(midi_device, 1, 1, Util.scale(tension, 0, 100, 1, 72));
  // Strings Control 1
  Midi.setControl(midi_device, 1, 2, Util.scale(tension, 0, 100, 16, 127));
  // Strings Control 2
  Midi.setControl(midi_device, 1, 3, Util.scale(tension, 0, 100, 0, 96));
}

module.exports = {
  tick: tick,
  init: init,
};
