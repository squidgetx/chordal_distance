var thresholds = 50;
inlets = 1;
outlets = 2;
var notes = [];
// 69: A
// A
// Inversions: C E G 
var up = [
	[91], [89], [88], // options within which you can rotate
];

// on tension release, transition to these notes (depending on threshold)
var down = [
	[62], [65],
];
var currentIndex = 0;
var lastAngle = 0;
var threshold = 30;

// receive bang when tension is "released."
function bang() {
	playNotes(down[lastAngle]);
}

function list() {
	var tension = arguments[0];
	var angle = arguments[1];
	
	if (tension > threshold && (currentIndex == 0 || angle != lastAngle)) {
		currentIndex = 1;
		playNotes(up[angle])
	}
	if (tension < threshold - 10 && currentIndex == 1) {
		currentIndex = 0;
		playNotes([]);
	}
	
	lastAngle = angle;
}

function playNotes(newNotes) {
	post('[1] playnotes')
	post(newNotes)
	post('\n')
	for(var i = 0; i < notes.length; i++) {
		outlet(1, 0);
		outlet(0, notes[i]);
	}

	for(var i = 0; i < newNotes.length; i++) {
		outlet(1, 80);
		outlet(0, newNotes[i]);
	}
	notes = newNotes;
}