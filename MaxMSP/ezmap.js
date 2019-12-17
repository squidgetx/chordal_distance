function msg_float(f) {
		if (f > 127) {
			outlet(0, 127 - f % 127);
		} else {
			outlet(0, f)
		}
}