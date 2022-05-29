const Midi = require("./midi");
const Util = require("./util");
const Harmony = require("./harmony");

const VIOLA_OCTAVE = 5;
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
      Midi.NOTES.C,
      Midi.NOTES.F,
      Midi.NOTES.C,
    ]),
    VIOLA_OCTAVE
  );
  if (tension > 3) {
    Midi.playChord(
      midi_device,
      VIOLA_CHANNEL,
      [viola_root, viola_root],
      [80, 80]
    );
  } else {
    Midi.stopAll(midi_device, VIOLA_CHANNEL);
  }

  let synth_note = Harmony.makeNote(
    Util.index(angleX2, Harmony.SCALE),
    STRINGS_OCTAVE
  );
  let synth_second = Util.index(angleY1, Harmony.INTERVALS) + synth_note;

  if (tension > 6) {
    Midi.playChord(
      midi_device,
      STRINGS_CHANNEL,
      [synth_note, synth_second],
      [80, 80]
    );
  } else {
    Midi.stopAll(midi_device, STRINGS_CHANNEL);
  }

  // Effects
  // Viola Control 1
  Midi.setControl(midi_device, 1, 1, Util.clamp_scale(tension, 0, 50, 1, 72));
  // Strings Control 1
  // synth filter
  Midi.setControl(midi_device, 1, 2, Util.clamp_scale(tension, 0, 50, 30, 100));
  // Strings Control 2
  // second string section
  Midi.setControl(midi_device, 1, 3, Util.scale(tension, 10, 100, 30, 96));
}

module.exports = {
  tick: tick,
  init: init,
};
