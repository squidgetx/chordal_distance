outlets = 3;
var wave = 0;
var vec = 0;
var negvec = 0;

function msg_float(f) {
	wave += Math.abs(f);
	vec += f;
	negvec -= (f/2);
	if (wave <= 0) {
		wave = 0;
	} else {
		wave -=  (wave / 100) + 0.2;
	}
	if (vec <= 0) {
		vec = 0;
	} else {
		vec -= (vec / 100) + 0.2;
	//	post(vec);
	}
	if (negvec <= 0) {
		negvec = 0;
	} else {
		negvec -= (negvec / 100) + 0.2;
	}
	outlet(0, wave);
	outlet(1, vec);
	outlet(2, negvec);
}