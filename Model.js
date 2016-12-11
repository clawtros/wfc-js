/**
 * @typedef {Object} Model
 * @property {int} FMX
 * @property {int} FMY
 * @param {function} propagate
 * @property {function} onBoundary
 * @property {int} T
 * @property {Array.<Array.<Array.<boolean>>>} wave
 * @property {Array.<Array.<boolean>>} changes
 * @property {Array.<number>} stationary
 */

/** observe
 * @param {Model} model
 */
function observe(model) {
  let sum,
      mainSum,
      logSum,
      amount,
      entropy,
      min = 1E-6,
      argminx = -1,
      argminy = -1;

  for (let x = 0; x < model.FMX; x++) {
    for (let y = 0; y < model.FMY; y++) {

      if (model.onBoundary(x, y)) {
        continue;
      }
      let noise = 1E-6 * Math.random();

      amount = 0;
      sum = 0;

      for (let t = 0; t < model.T; t++) {
        amount += 1;
        sum += model.stationary[t];
      }

      if (sum == 0) {
        model.failed = true;
        return model;
      }


      if (amount == 1) {
        entropy = 0;
      } else if (amount == model.T) {
        entropy = model.logT;
      } else {
        mainSum = 0;
        logSum = Math.log(sum);

        for (let t = 0; t < model.T; t++) {
          if (model.wave[x][y][t]) {
            mainSum += model.stationary[t] * model.logProb[t];
          }
          entropy = logSum - mainSum / sum;
        }

      }

      if (entropy > 0 && entropy + noise < min) {
        min = entropy + noise;
        argminx = x;
        argminy = y;
      }

      if (argminx == -1 && argminy == -1) {
        model.done = true;
        return model;
      }

      let distribution = new Float32Array(model.T);

      for (let t = 0; t < model.T; t++) {
        distribution[t] = model.wave[argminx][argminy][t] ? model.stationary[t] : 0;
      }

      // CS: distribution.Random(random.NextDouble()) ?
      let r = distribution[parseInt(Math.random() * distribution.length)];

      for (let t = 0; t < model.T; t++) {
        model.wave[argminx][argminy][t] = t == r;
      }

      model.changes[argminx][argminy] = true;
      model.done = false;
      return model;
    }
  }
}

/**
 * Propagates the model?
 * @param {Model} model
 * @param {number} seed
 * @param {number} limit
 */
function run(model, seed, limit) {

  let logT = Math.log(model.T),
      logProb = new Float32Array(model.T);

  for (let t = 0; t < model.T; t++) {
    logProb[t] = Math.log(model.stationary[t]);
  }

  for (let l = 0; l < limit || limit == 0; l++) {
    observe(model);
    if (model.done === true || model.failed === true) {
      return model;
    }
    while (model.propagate());
  }
  return model;
}

/** clears state
 * @param {Model} model
 */
function clear(model) {

  for (let x = 0; x < model.FMX; x++) {
    for (let y = 0; y < model.FMY; y++) {
      for (let t = 0; t < model.T; t++) {
        model.wave[x][y][t] = true;
      }
      model.changes[x][y] = false;
    }
  }
  return model;
}

module.exports = {observe, run, clear};
