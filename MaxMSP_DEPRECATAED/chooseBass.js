var note;

function msg_float(f) {
	if (f > 550) {
		note = 50;
	} else {
		note = 52;
	}
}

function bang() {
	outlet(0, note);
}