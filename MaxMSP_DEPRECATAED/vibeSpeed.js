outlets = 2;

function list() {
	var f = arguments[0];
	var noAct = arguments[1];
	if (f > 330) {
		outlet(1, f - noAct);
	} else {
		outlet(0, f + noAct);
	}
	
	
}