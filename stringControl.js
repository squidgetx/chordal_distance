var am9 = [81, 84, 88, 91, 95];

module.exports = function () {
  init: function() {

  },
  updateTension: function(tension) {
    if (tension < 200) {

    }

  },
}

/*
inlets = 1;
outlets = 5;

// A C E G B

// Tension controls which colors are available
// When a color is added its volume acceleration is a function of the tension
// it was initiated at
// How do you initiate a new color?
// Option 1: at certain tension
// Option 2: at certain angle
// Option 3: gyro/accel tap/sweep

var am9 = [81, 84, 88, 91, 95];
var notes = [0,0,0,0];
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

var accCounter = 0;
var accSum = 0;
var velCounter = 0;
var velSum =0;
var init = 0;
var lastD = 0;
var gestureStarted = 0;

function list() {
	var displacement = arguments[0] + 30;
	var velocity = arguments[1];
	var angle = arguments[2];
	var accMag = Math.max(0, arguments[3]);
	if (displacement > 10 && init == 0) {
		addNote(103, 100000, 100);
		init = 1;
	}
	if (displacement < 10 && init == 1) {
		for(var i = 0; i < notes.length; i++) {
			if (notes[i] == 0) {
				continue;
			}
			outlet(2, 0);
			outlet(1, notes[i].note);
			outlet(0, i);
			notes[i]= 0;

		}
		init = 0;
	}
	//processGesture(accMag);
	outlet(4, accMag)
	var velocity = lastD - displacement;
	var activeNotes = notes.filter(function(f) { return f != 0 }).length;
	if (displacement > activeNotes * 40 && activeNotes < 4) {
		velCounter++;
		velSum += velSum;
	//	post(velocity);
		addNoteWithDisplacement(displacement, velocity, angle);
	} else {
		velCounter = 0;
	}
	lastD = displacement;


	for(var i = 0; i < notes.length; i++) {
		if (notes[i] == 0) {
			continue;
		}
		var t = Date.now();
		if (t - notes[i].begin > notes[i].duration) {
			outlet(2, 0);
			outlet(1, notes[i].note);
			outlet(0, i);
			notes[i]= 0;
		}
	}

}

function processGesture(accMag) {
	if (accMag > 0.2 && gestureStarted == 0) {
		accCounter++;
		accSum += accMag;
		if (accCounter == 5 ) {
			post("gesture started");
			post(accSum);
			post("\n")
			gestureStarted = 1;
			accCounter = 0;
			accSum = 0;
			//addNoteWithDisplacement(displacement, accSum);
			outlet(4, accSum);
		}
	} else if (accMag <= 0.2 && gestureStarted == 1) {
		if (accMag <= 0.05) {
			accCounter++;
		} else {
			accCounter = 0;
		}
		if (accCounter == 5) {
			post(accSum);
			post(" gesture ended\n");
			gestureStarted = 0;
			accCounter = 0;
			//accSum = 0;
		}
	} else if (accMag > 0.2 && gestureStarted == 1) {
		outlet(4, accSum);
		accSum += accMag;
	} else {
		accCounter = 0;
		accSum -= 0.2;
		if (accSum < 0) {
			accSum = 0;
		}
		outlet(4, accSum);
	}
}

function map(n, start1, stop1, start2, stop2) {
  return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
}

function init() {
}

function addNoteWithDisplacement(displacement, aSum, angle) {
	accCounter = 0;
	accSum = 0;
	velCounter = 0;
	velSum = 0;
	note = getAvailableNote(displacement, angle);
	duration = map(aSum, 0, 30, 5000, 15000);
	velocity = map(aSum, 0, 30, 80, 100);
	addNote(note, duration, velocity);
}

function addNote(note, duration, velocity) {
	// min 7 => long
	// max 30 => short
	//post("addNote\n");
	var candidates = [];
	for(var i = 0; i < notes.length; i++) {
		if (notes[i] == 0) {
			candidates.push(i);
		}
	}
	if (candidates.length === 0) {
		post("No candidates\n");
		return; // do nothing, no voices available :(
	}
	var chosenVoice = candidates[Math.floor(Math.random() * candidates.length)];
	//	post("chose " + chosenVoice + "\n");
	notes[chosenVoice] = {
		note: note,
		duration: duration,
		begin: Date.now()
	};
//	post("Sending " + note + " to " + chosenVoice + " for " + duration+ "\n");

	outlet(3, duration); // duration
	outlet(2, velocity); // velocity :(
	outlet(1, note);
	outlet(0, chosenVoice);
}

function getAvailableNote(displacement, angle) {
//	var a = Math.floor(map(angle, -3.14, 3.14, 0, 4));
//	post(a);
	return am9[Math.floor(Math.random() * am9.length)] - 12;// - a * 12;
}


*/
