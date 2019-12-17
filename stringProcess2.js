inlets = 2;
outlets = 3;
var notes = [0,0,0,0,0];
// 69: A
// A G A E A E
var am9 = [69, 91, 81, 88, 57, 64];
var am9 = [69, 91, 81, 88, 57, 64];


var dm9 = [64, 74, 77, 69, 64, 62]
// c d 


// C E G B D C9
// E G B D F E9

var all = [am9];


var thresholds = [10, 20, 50, 52, 100, 102]
var lastTension = 0;
var lastAngle = 0;

function dump() {
	for(var i = 0; i < notes.length; i++) {
		if (notes[i] == 0) {
			post("0")
		} else {
			post("n: " + notes[i].note);
		}
	}
	post("\n");

}

function list() {
	var f = arguments[0];
	var angleMapped = Math.floor(arguments[1]);
	var angleMapped2 = Math.floor(arguments[2]);
	var downwardVel = arguments[3];
	var c = am9;


	// stack 4ths?
	if (lastTension < f) {
		for(var i = 0; i < thresholds.length; i++) {
			var chordTone = c[i];
			if (f > thresholds[i] && notes[i] != chordTone) {
				outlet(0, [i, notes[i], 0]);		
				outlet(0, [i, chordTone, 80]);		
				notes[i] = chordTone;
			}
		}
	} else {
		for(var i = 0; i < thresholds.length; i++) {
			if (f < thresholds[i] && notes[i] != 0) {
				outlet(0, [i, notes[i], 0]);
				notes[i] = 0;
			}
		}
	}
	lastTension = f;
	
}