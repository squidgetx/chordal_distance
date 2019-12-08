inlets = 1;
outlets = 3;

// 4 channels
var notes = [0,0,0,0];

// Basic midi note multiplexer with 4 voices. Randomly assigns new notes to
// any available voices.
function dump() {
	for (var i = 0 ; i< notes.length; i++) {
		post(notes[i]);
	
	}
	post("\n");
	}
function list() {

	var note = arguments[0];
	var velocity = arguments[1];
	post('nsin ' + note + " " + velocity + "\n");
	if (velocity == 0) {
		var i;
		for(i = 0; i < notes.length; i++) {
			if (notes[i] == note) {
				notes[i] = 0;
				outlet(2, 0); // note off message
				outlet(1, note);
				outlet(0, i); // voice number
				return;
			}
		}
	//	post('not found\n');
	} else {
		var candidates = [];
		for(var i = 0; i < notes.length; i++) {
			if (notes[i] == 0) {
				candidates.push(i);
			}
		}
	/*	post("candidates: (velocity)" + velocity + " ");
		for(var i = 0; i < candidates.length; i++) {
			post(candidates[i])
		}
		post("\n");*/

		if (candidates.length === 0) {
			return; // do nothing, no voices available :(
		}
		var chosenVoice = candidates[Math.floor(Math.random() * candidates.length)];
	//	post("chose " + chosenVoice + "\n");
		notes[chosenVoice] = note;
		outlet(2, velocity);
		outlet(1, note);

		outlet(0, chosenVoice);
	}

}