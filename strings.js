const Midi = require("./midi");
const Util = require("./util");
const Harmony = require("./harmony");

const VIOLA_OCTAVE = 5;
const VIOLA_CHANNEL = 0;

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
      Midi.NOTES.F - 12,
      Midi.NOTES.C,
      Midi.NOTES.C,
      Midi.NOTES.F - 12,
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
  let synth_notes = [
    Midi.NOTES.C,
    Midi.NOTES.D,
    Midi.NOTES.E,
    Midi.NOTES.F,
    Midi.NOTES.G,
    Midi.NOTES.A,
    Midi.NOTES.Bb,
  ];
  if (tension > 50) {
    synth_notes = [Midi.NOTES.D, Midi.NOTES.G];
  }

  const STRINGS_OCTAVE = Util.index(tension / 100, [5, 5, 4, 3]);
  let synth_note = Harmony.makeNote(
    Util.index(angleX2, synth_notes),
    STRINGS_OCTAVE
  );
  const intervals = [
    Midi.INTERVALS.octave,
    Midi.INTERVALS.maj6,
    Midi.INTERVALS.p4,
    Midi.INTERVALS.maj3,
    Midi.INTERVALS.unison,
    Midi.INTERVALS.maj2,
    Midi.INTERVALS.p5,
    Midi.INTERVALS.min7,
    Midi.INTERVALS.octave,
  ];

  let synth_second = Util.index(angleY1, intervals) + synth_note;

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
  // Viola Control 1 (volume)
  // Get quieter after peaking @ tension = 40
  const PEAK = 20;
  if (tension > PEAK) {
    Midi.setControl(
      midi_device,
      1,
      1,
      Util.clamp_scale(tension, PEAK, 100, 72, 16)
    );
  } else {
    Midi.setControl(
      midi_device,
      1,
      1,
      Util.clamp_scale(tension, 0, PEAK, 1, 72)
    );
  }
  // Strings Control 1
  // synth filter
  if (tension > 80) {
    Midi.setControl(
      midi_device,
      1,
      2,
      Util.clamp_scale(tension, 80, 100, 0, 84)
    );
  } else if (tension > 50) {
    Midi.setControl(
      midi_device,
      1,
      2,
      Util.clamp_scale(tension, 50, 80, 84, 0)
    );
  } else {
    Midi.setControl(
      midi_device,
      1,
      2,
      Util.clamp_scale(tension, 0, 50, 30, 84)
    );
  }
  // Strings Control 2
  // second string section
  Midi.setControl(midi_device, 1, 3, Util.scale(tension, 10, 100, 30, 96));
  // Strings reverb
  Midi.setControl(midi_device, 1, 4, Util.scale(angleY2, 0, 1, 0, 127));
  // Synth growl
  Midi.setControl(
    midi_device,
    1,
    5,
    Util.clamp_scale(tension, 50, 100, 64, 80)
  );
}

module.exports = {
  tick: tick,
  init: init,
};
