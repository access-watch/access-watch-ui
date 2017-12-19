import createTreemap from '../src/treemap';

describe('treemap', () => {
  it('normalizes the weights to fit', () => {
    const w = 60;
    const h = 40;
    const treemap = createTreemap([6, 6, 4, 3, 2, 2, 1], w, h);
    const areaSum = treemap.reduce(
      (sum, row) =>
        sum + row.reduce((subsum, el) => subsum + el.width * el.height, 0),
      0
    );
    expect(areaSum).toBe(w * h);
  });

  it('positions items correctly', () => {
    const w = 40;
    const h = 60;
    const treemap = createTreemap([6, 4, 4, 4, 4, 1], w, h);

    const first = treemap[0][0];
    const last =
      treemap[treemap.length - 1][treemap[treemap.length - 1].length - 1];
    expect(first.x).toBe(0);
    expect(first.y).toBe(0);
    // respect floating point errors
    expect(last.x).toBeCloseTo(w - last.width, 1e-10);
    expect(last.y).toBeCloseTo(h - last.height, 1e-10);
  });
});
