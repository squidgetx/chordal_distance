var lastTension = 0;

function msg_float(f) {
	outlet(0, f - lastTension);
	lastTension = f;
}