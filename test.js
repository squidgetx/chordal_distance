inlets = 1;
outlets = 1;
var am9 = [81, 84, 88, 91, 95];
var scale = [0, 2, 3, 5, 7, 8, 10]

function list() {
	var f = arguments[0] + 80;
	var a = arguments[1] + 3.142
	if (f < 0) {
		f = 0;
	}
	var offset = Math.floor(a / 6.28 * scale.length)
	var octave = Math.floor(f / 30) + 2;
	var p = Math.floor(f % (30) /30 * 5);
	//post(p);
	outlet(0, am9[p] - 60 + octave * 12 + offset);
}