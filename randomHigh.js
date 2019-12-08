
// A B C //D
var pitches = [100, 97, 91, 100];
var counter = 0;

function bang() {
	outlet(0, pitches[counter % pitches.length] - 12);
	counter++;
}