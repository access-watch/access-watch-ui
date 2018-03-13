export const sToMs = s => s * 1000;
export const msToS = ms => Math.round(ms / 1000);

// The possible amount of time by which activity data will be grouped
export const possibleSteps = [
  1,
  2,
  5,
  10,
  30,
  60,
  2 * 60,
  5 * 60,
  10 * 60,
  30 * 60,
  1 * 3600,
  2 * 3600,
  5 * 3600,
  10 * 3600,
  1 * 24 * 3600,
];

export const findPossibleStep = (interval, ticks = 150) => {
  const tmpStep = Math.round(Math.floor(interval / 1000) / ticks);
  return possibleSteps.find((p, i, pDur) => {
    if (i === pDur.length - 1) {
      return true;
    }
    const nextDiff = tmpStep - pDur[i + 1];
    return Math.abs(tmpStep - p) < Math.abs(nextDiff) && nextDiff < 0;
  });
};
