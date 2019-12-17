var v = 0;

function msg_float(f) {
	if (v < 40) {
			v += Math.abs(f - 1);

	}
	v -= 0.1
	if (v < 0) {
		v = 0;
	}
	outlet(0, v);
}
	