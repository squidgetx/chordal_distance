var listening = 0;
var counter = 0;

function list() {
	var tension = arguments[0];
	var dT = arguments[1];
	
	if (listening == 0) {
		if (tension > 300) {
			counter++;
		} else {
			counter = 0;
		}
		if (counter == 8) {
			post('high!\n')
			listening = 1;
			counter = 0;
		}
	} else {
		if (tension < 300) {
			counter++;
		} else {
			counter = 0;
		}	
		if (counter == 8) {
			outlet(0, 1);
			listening = 0;
			counter = 0;
		}
	}
	//post(counter);
}