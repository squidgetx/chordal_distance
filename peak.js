var listening = 0;

function msg_float(f) {
	if (f > 5) {
		listening = 1;
	}
	if (listening == 1) {
		if (Math.abs(f) < 1) {
			outlet(0, 1);
			listening = 0;
		
		}
		
	}
}