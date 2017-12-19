import createTreemap from '../../treemap';

// min dimensions for rendering
export const SESSIONS_MIN_WIDTH_DESKTOP = 980;
export const SESSIONS_MIN_HEIGHT_DESKTOP = 480;

// dimensions used for generating treemap
// using a vertical container so that more blocks will be stretched in width
// rather than height
export const TREEMAP_WIDTH = 10;
export const TREEMAP_HEIGHT = 10;

// transform session blocks for a percentage based layout
export const withPercentageLayout = sessions => {
  const wMul = 100 / TREEMAP_WIDTH;
  const hMul = 100 / TREEMAP_HEIGHT;

  return sessions.map(block =>
    Object.assign({}, block, {
      width: wMul * block.width,
      height: hMul * block.height,
      x: wMul * block.x,
      y: hMul * block.y,
    })
  );
};

export const toSquarifiedTreemap = sessions => {
  if (!sessions || !sessions.length) {
    return [];
  }

  const weights = sessions.map(s => s.weight || s.count);
  const treemap = createTreemap(weights, TREEMAP_WIDTH, TREEMAP_HEIGHT);

  // make flat array of blocks
  const items = [].concat(...treemap);

  // add corresponding sessions data to node (they're assumed to be ordered!!)
  return items.map((block, i) => ({
    ...block,
    ...sessions[i],
  }));
};

export const setSessionWeight = session => ({
  ...session,
  weight: session.count ** 0.4,
});

const compose = (...fns) => arg => fns.reduce((r, fn) => fn(r), arg);

export const sessionsToTreemap = compose(
  sessions => sessions.map(setSessionWeight),
  toSquarifiedTreemap,
  withPercentageLayout
);
