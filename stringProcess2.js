inlets = 2;
outlets = 3;
var notes = [0,0,0,0,0];
// G, AE
var am9 = [91, 69, 76, 72, 83];
var am9overD = [91, 69, 84, 74, 83];
var am9overE = [91, 72, 69, 76, 83];
var am9overC = [88, 71, 67, 74, 84];

var all = [am9, am9overD, am9overE, am9overC];


var thresholds = [10, 50, 52, 150, 152]
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

	var chord = all[angleMapped];
	if (lastTension < f) {
		for(var i = 0; i < thresholds.length; i++) {
			if (f > thresholds[i] && notes[i] != chord[i]) {
				outlet(0, [i, notes[i], 0]);		
				outlet(0, [i, chord[i], 80]);		
				notes[i] = chord[i];
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