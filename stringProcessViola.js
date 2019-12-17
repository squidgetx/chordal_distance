inlets = 1
outlets = 2;
var notes = [];

var up = [
	// AE GE GD GB
	[57, 64], [55, 64], [55, 62], [55, 59],
	// C G A E  // B G A E // A G B E  // G A B E
//	[[48, 55, 69], [47, 55, 69], [45, 55, 71], [43, 57, 71]]
];

var down = [
	[53, 64], [53, 65], [53, 64], [53, 65],
]

var threshold = 150;
var currentIndex = 0;
var lastAngle = 0;

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
	post('[0] playnotes')
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