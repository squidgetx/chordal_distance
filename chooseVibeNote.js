outlets = 3;
var note = 69;
var notes = [69, 72, 76];
var value = 0;
// choose from A / C / E 
function bang() {
	outlet(0, note);
	outlet(1, Math.floor(Math.random() * 10 + 80));
}

function list() {
	var f = arguments[0];
	var angle = arguments[1];
	if (value < 30) {
		value += f / 2;
	}
	value -= 1.2;

	if (value < 0) {
		value = 0;
	} else {
	}
	outlet(2, value);
	var v = value / 4;
	//outlet(0, notes[Math.floor(v) % notes.length] + 12 * Math.floor(v / notes.length) - 12);
	note = notes[Math.floor(v + angle) % notes.length] + 12 * Math.floor(v / notes.length) - 12;
}