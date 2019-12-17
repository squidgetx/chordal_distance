outlets = 2;

function msg_float(f) {
	var speed;
	if (f > 400) {
			outlet(1, f);
	} else {
		outlet(0, f);
	}
	
	
}