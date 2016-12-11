const Model = require('./Model'),
      Bitmap = require('./Bitmap');

/**
 * @typedef {Object} ModelParams
 * @property {int} FMX
 * @property {int} FMY
 * @property {function} onBoundary
 * @property {int} T
 */

/**
 * @typedef {Object} state
 * @property {Array.<Array.<Array.<boolean>>>} wave
 * @property {Array.<Array.<boolean>>} changes
 * @property {Array.<number>} stationary
 */


/**
 * @param {Bitmap} bitmap
 * @param {int} N
 * @param {int} width
 * @param {int} height
 * @param {bool} periodicInput
 * @param {bool} periodicOutput
 * @param {int} symmetry
 * @param {int} ground
 */
function createOverlappingModel(bitmap, N, width, height, periodicInput, periodicOutput, symmetry, _ground) {
  const colors = bitmap.getUniqueColors(),
        sample = bitmap.getColors(),
        SMX = bitmap.width,
        SMY = bitmap.height,
        FMX = width,
        FMY = height,
        periodic = periodicOutput,
        C = colors.length,
        W = Math.pow(C, N * N),
        pattern = f =>
          {
            let result = new Uint8Array(N * N);
            for (let y = 0; y < N; y++) {
              for (let x = 0; x < N; x++) {
                result[x + y * N] = f(x, y);
              }
            }
            return result;
          },
  //f => sample.map((_, y) => (color, x) => f(x, y),
        patternFromSample = (x, y) => pattern((dx, dy) =>
          bitmap.getColor((x + dx) % SMX, (y + dy) % SMY)),
        rotate = p => pattern((x, y) => p[N - 1 - y + x * N]),
        reflect = p => pattern((x, y) => p[N - 1 - x + y * N]),
        index = p => {
          let result = 0,
              power = 1;
          for (let i = 0; i < p.length; i++) {
            result += p[p.length - 1 - i] * power;
            power *= C;
          }
          return result;
        },
        patternFromIndex = ind => {
          let residue = ind,
              power = W,
              result = new Uint8Array(N * N);

          for (let i = 0; i < result.length; i++) {
            power /= C;
            let count = 0;

            while (residue >= power) {
              residue -= power;
              count++;
            }

            result[i] = count;
          }
          return result;
        },
        agrees = (p1, p2, dx, dy) => {
          let xmin = dx < 0 ? 0 : dx,
              xmax = dx < 0 ? dx + N : N,
              ymin = dy < 0 ? 0 : dy,
              ymax = dy < 0 ? dy + N : N;

          for (let y = ymin; y < ymax; y++) {
            for (let x = xmin; x < xmax; x++) {
              if (p1[x + N * y] != p2[x - dx + N * (y - dy)]) return false;
            }
          }
          return true;
        },
        ordering = [],
        propagator = [], // int[2 * N - 1][][][]
        weights = {};

  for (let y = 0; y < (periodicInput ? SMY : SMY - N + 1); y++) {
    for (let x = 0; x < (periodicInput ? SMX : SMX - N + 1); x++) {
      let ps = [];

      ps[0] = patternFromSample(x, y);
      ps[1] = reflect(ps[0]);
      ps[2] = rotate(ps[0]);
      ps[3] = reflect(ps[2]);
      ps[4] = rotate(ps[2]);
      ps[5] = reflect(ps[4]);
      ps[6] = rotate(ps[4]);
      ps[7] = reflect(ps[6]);

      for (let k = 0; k < symmetry; k++) {
        let ind = index(ps[k]);
        if (weights[ind] !== undefined) {
          weights[ind]++;
        } else {
          weights[ind] = 1;
          ordering.push(ind);
        }
      }
    }
  }

  let T = weights.length,
      ground = (_ground + T) % T, // this.ground = (ground + T) % T;
      patterns = ordering.map(patternFromIndex),
      stationary = ordering.map(w => weights[w]),
      wave = [],
      changes = [];

  for (let x = 0; x < FMX; x++) {
    wave[x] = [];
    changes[x] = [];

    for (let y = 0; y < FMY; y++) {
      wave[x][y] = [];
      changes[x][y] = false;

      for (let t = 0; t < T; t++) {
        wave[x][y][t] = true;
      }

    }
  }

  for (let x = 0; x < 2 * N - 1; x++) {
    propagator[x] = [];
    for (let y = 0; y < 2 * N - 1; y++) {
      propagator[x][y] = [];
      for (let t = 0; t < T; t++) {
        list = [];
        for (let t2 = 0; t2 < T; t2++) {
          if (agrees(patterns[t], patterns[t2], x - N + 1, y - N + 1)) {
            list.push(t2);
          }
        }
        propagator[x][y][t] = [];
        for (let c = 0; c < list.length; c++) {
          propagator[x][y][t][c] = list[c];
        }
      }
    }
  }

  return {
    FMX, FMY, T, wave, changes, stationary,
    onBoundary: function(x, y) {
      return !periodic && (x + N > FMX || y + N > FMY)
    },
    propagate: function() {
      let change = false,
          b = false,
          x2,
          y2;

      for (let x1 = 0; x1 < FMX; x1++) {
        for (let y1 = 0; y1 < FMY; y1++) {
          if (changes[x1][y1]) {
            changes[x1][y1] = false;
            for (let dx = -N + 1; dx < N; dx++) {
              for (let dy = -N + 1; dy < N; dy++) {
                x2 = x1 + dx;
                if (x2 < 0) {
                  x2 += FMX;
                } else if (x2 >= FMX) {
                  x2 -= FMX;
                }

                y2 = y1 + dy;
                if (y2 < 0) {
                  y2 += FMY;
                } else if (y2 >= FMY) {
                  y2 -= FMY;
                }

                if (!periodic && (x2 + N > FMX || y2 + N > FMY)) continue;

                let w1 = wave[x1][y1];
                let w2 = wave[x2][y2];
                let p = propagator[N - 1 - dx][N - 1 - dy];

                for (let t2 = 0; t2 < T; t2++) {
                  if (!w2[t2]) continue;

                  b = false;

                  let prop = p[t2];

                  for (let i1 = 0; i1 < prop.length && !b; i1++) {
                    b = w1[prop[i1]];
                  }

                  if (!b) {
                    changes[x2][y2] = true;
                    change = true;
                    w2[t2] = false;
                  }
                }
              }
            }
          }
        }
      }
      return change;
    }
  }
}


module.exports = { createOverlappingModel }
