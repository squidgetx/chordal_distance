outlets = 4;
var note = 67;
var notes = [67, 74, 79];
var value = 0;
// choose from A / C / E 
function bang() {
	outlet(0, note);
	outlet(1, Math.floor(Math.random() * 20 + 70));
}

function list() {
	var f = arguments[0];
	var angle = arguments[1];
	if (value < 24) {
		value += f;
	}
	value -= 1.2;

	if (value < 0) {
		value = 0;
	} else {
	}
	outlet(2, value);
	outlet(3, 1000 / (value + 0.1));
	var v = value / 2
	//outlet(0, notes[Math.floor(v) % notes.length] + 12 * Math.floor(v / notes.length) - 12);
	note = notes[Math.floor(v + angle) % notes.length] + 12 * Math.floor(v / notes.length) - 12;
}