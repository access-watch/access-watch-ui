// Squarified treemap
//
// Exposes a single static function that takes an array of weights, a width
// and a height and generates a treemap.
// -----------------------------------------------------------------------------

const arraySum = arr => arr.reduce((sum, num) => sum + num, 0);

/**
 * gives the highest aspect ratio of an item of `row` given the length `w` of
 * the side along which they're placed along.
 */
const worst = (row, w) => {
  // sum up all areas
  const s = arraySum(row);

  const areaMax = Math.max(...row);
  const areaMin = Math.min(...row);

  return Math.max(w * w * areaMax / (s * s), s * s / (w * w * areaMin));
};

/**
 * Normalizes `weights` so that their combined sum will match `area`
 */
const normalize = (weights, area) => {
  const div = arraySum(weights) / area;
  return weights.map(el => el / div);
};

/**
 * Create x,y,width,height for each item in a treemap
 */
const layoutTreemap = (treemap, w, h) => {
  let xlen = w;
  let ylen = h;

  return treemap.map(r => {
    const row = [...r];
    // short side
    const breadth = arraySum(row) / Math.min(xlen, ylen);

    // rows are created along the shortest edge of the rectangle.
    const isVertical = xlen > ylen;

    let area = null;
    for (let i = 0; i < row.length; i++) {
      area = row[i];

      if (isVertical) {
        // this row is vertical
        row[i] = {
          width: breadth,
          height: area / breadth,
          x: i > 0 ? row[i - 1].x : w - xlen,
          y: i > 0 ? row[i - 1].height + row[i - 1].y : h - ylen,
        };
      } else {
        // this row is horizontal
        row[i] = {
          width: area / breadth,
          height: breadth,
          x: i > 0 ? row[i - 1].width + row[i - 1].x : w - xlen,
          y: i > 0 ? row[i - 1].y : h - ylen,
        };
      }
    }

    // subtract the breadth of the row
    if (isVertical) {
      xlen -= breadth;
    } else {
      ylen -= breadth;
    }

    return row;
  });
};

/**
 * Create a treemap
 */
const createTreemap = (weights, w, h) => {
  // make `weights` fit perfectly into `w` `h` and sort them in decending order
  const queue = normalize(weights, w * h);

  // add the first item
  let area = queue.shift();

  // a horizontal or vertical row in the container
  let row = [area];

  const treemap = [row];

  let xlen = w;
  let ylen = h;

  let length = -1;
  while (queue.length > 0) {
    area = queue.shift();
    length = Math.min(xlen, ylen);
    if (worst(row.concat(area), length) <= worst(row, length)) {
      // the worst aspect ratio improves when `area` is added to the row
      row.push(area);
    } else {
      // adding `area` to `row` disimproved the aspect ratio. So this row is
      // finished. Since the queue is assumed to be ordered, the next area will
      // be less than or equal to `area`
      const breadth = arraySum(row) / length;

      // subtract the breadth of the finished row from the container
      if (xlen > ylen) {
        // vertical row
        xlen -= breadth;
      } else {
        // horizontal row
        ylen -= breadth;
      }

      // create and add the new row to the treemap.
      row = [area];
      treemap.push(row);
    }
  }
  return layoutTreemap(treemap, w, h);
};

export default createTreemap;
