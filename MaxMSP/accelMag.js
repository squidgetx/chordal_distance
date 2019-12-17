inlets = 1;
outlets = 1;

var a = 0;

function msg_float(f) {
	a += (f - 1) * 1.2;
	a -= a / 100 + 0.01;
	if (a < 0 || a == NaN) {
		a = 0;
	}
	outlet(0, a);
}