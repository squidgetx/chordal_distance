function clamp(a, l, u) {
  if (l > u) {
    let temp = u;
    u = l;
    l = temp;
  }
  return Math.min(Math.max(a, l), u);
}

function scale(x, xmin, xmax, ymin, ymax, post_clamp = false) {
  // linear scale x with range (xmin, xmax) to range (ymin, ymax)
  let xnorm = x - xmin;
  let factor = (ymax - ymin) / (xmax - xmin);
  let value = xnorm * factor + ymin;
  if (post_clamp) {
    return clamp(value, ymin, ymax);
  } else {
    return value;
  }
}

function clamp_scale(x, xmin, xmax, ymin, ymax) {
  return scale(x, xmin, xmax, ymin, ymax, true);
}

function index_array(x, arr) {
  // x must be 0-1
  x = clamp(x, 0, 0.99);
  return arr[Math.floor(x * arr.length)];
}

module.exports = {
  clamp: clamp,
  scale: scale,
  clamp_scale: clamp_scale,
  index: index_array,
};
