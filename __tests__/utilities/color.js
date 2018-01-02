import {
  stringToRGB,
  rgbToString,
  lighten,
  calculateColorGradient,
} from '../../src/utilities/color';

const randomColorTestCase = {
  rgb: {
    R: 255,
    G: 241,
    B: 0,
  },
  string: '#fff100',
};

const whiteColorTestCase = {
  rgb: {
    R: 255,
    G: 255,
    B: 255,
  },
  string: '#ffffff',
};

const blackColorTestCase = {
  rgb: {
    R: 0,
    G: 0,
    B: 0,
  },
  string: '#000000',
};

describe('stringToRGB', () => {
  const testStringToRGB = ({ rgb, string }) => {
    expect(stringToRGB(string)).toEqual(rgb);
  };

  it('transforms color string to object with RGB properties', () => {
    testStringToRGB(randomColorTestCase);
  });

  it('works with white', () => {
    testStringToRGB(whiteColorTestCase);
  });

  it('works with black', () => {
    testStringToRGB(blackColorTestCase);
  });
});

describe('rbgToString', () => {
  const testRgbToString = ({ rgb, string }) => {
    expect(rgbToString(rgb)).toEqual(string);
  };

  it('transforms RGB color object to string', () => {
    testRgbToString(randomColorTestCase);
  });

  it('works with white', () => {
    testRgbToString(whiteColorTestCase);
  });

  it('works with black', () => {
    testRgbToString(blackColorTestCase);
  });
});

describe('lighten', () => {
  it('ligthens a random color', () => {
    expect(lighten('#674421', 0.01)).toEqual('#6a4724');
  });

  it('does not ligthen white', () => {
    expect(lighten('#ffffff', 0.5)).toEqual('#ffffff');
  });

  it('ligthen up to white', () => {
    expect(lighten('#458435', 1)).toEqual('#ffffff');
  });

  it('works on black', () => {
    expect(lighten('#000000', 0.5)).toEqual('#808080');
  });
});

describe('calculateColorGradient', () => {
  it('calculates a gradient color stop', () => {
    expect(calculateColorGradient(1, '#000000', '#ffffff', 0.5)).toEqual(
      '#808080'
    );
  });

  it('can use a factor for non linear gradient', () => {
    expect(calculateColorGradient(2, '#000000', '#ffffff', 0.5)).toEqual(
      '#404040'
    );
  });

  it('can have a max percent gradient value', () => {
    expect(calculateColorGradient(1, '#000000', '#ffffff', 0.4, 0.8)).toEqual(
      '#808080'
    );
  });

  it('works correctly with max value + max percent gradient value', () => {
    expect(calculateColorGradient(1, '#000000', '#ffffff', 0.8, 0.4)).toEqual(
      '#ffffff'
    );
  });
});
