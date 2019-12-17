


var thirdIntervals = [4,3,4,3,4,3,3,3,4,3,4,3]

function getThird(scaleDeg) {
	return thirdIntervals[scaleDeg];
	
}

function list() {
	var scale_deg = arguments[0]
	outlet(0,getThird(scale_deg))
	
}