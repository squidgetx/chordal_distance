
var note = 72;
var notes = [67, 67, 69, 69, 69, 74];
// choose from C, D / E / G / A
function bang() {
	outlet(0, note);
}

function msg_float(f) {
	note = notes[Math.floor(f)];
}