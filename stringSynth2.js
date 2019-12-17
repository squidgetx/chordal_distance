outlets = 2;
inlets = 1;

var notes = [];

var up = [
	
	[64, 69], [60, 69], [67, 69], [57, 69],
	// C G E A // G C E A // E G C A // 
//	[[48, 67, 64, 69], [52, 60, 67, 69], [55, 60, 64, 69], [64, 60, 67, 57]]
];

var down = [
	[62, 57], [62, 60], [62, 57], [62, 60]
]

var threshold = 75;
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