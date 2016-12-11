const PNG = require('pngjs').PNG,
      fs = require('fs');

function bitmapFromFS(filename) {
  const file = fs.readFileSync(filename),
        bmpData = PNG.sync.read(file);
  return createBitmap(bmpData.data, bmpData.width, bmpData.height)
}

/**
 * Creates a bitmap-like object with some array of [r,g,b,a,r,g,b,a, ... ]
 * @param {Array<number>} pixels
 * @param {int} width
 * @param {int} height
 */
function createBitmap(pixels, width, height) {
  const pixelColors = [],
        uniqueColors = [];

  for (var y = 0; y < height; y++) {
    let row = [],
        rowIdx = y * width * 4;
    for (var x = 0; x < width; x++) {
      let color = [0, 1, 2, 3].map(offset => parseInt(pixels[rowIdx + x * 4 + offset]));
      if (uniqueColors.map(JSON.stringify).indexOf(JSON.stringify(color)) === -1) {
        uniqueColors.push(color);
      }
      row.push(color);
    }
    pixelColors.push(row);
  }

  return {
    width, height,
    ascii: function() {
      let chars = "-~=*#@$";
      return pixelColors.map(
        row =>
          row.map(
            color => chars[color.slice(0,3).reduce((a,b)=>a+b, 0) / (255 * 3) * (chars.length - 1)] || "!"
          ).join("")
      ).join("\n")
    },
    getUniqueColors: function() {
      return uniqueColors;
    },
    getColors: function(x, y) {
      return pixelColors;
    },
    getColor: function(x, y) {
      return pixelColors[y][x];
    }
  }
}

module.exports = { createBitmap, bitmapFromFS }
