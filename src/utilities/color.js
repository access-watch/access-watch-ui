export const stringToRGB = function(colorString) {
  const rgbObj = {};
  // TODO Eventually accept other formats than 6 digits hex color?
  if (colorString.startsWith('#')) {
    rgbObj.R = parseInt(colorString.substr(1, 2), 16);
    rgbObj.G = parseInt(colorString.substr(3, 2), 16);
    rgbObj.B = parseInt(colorString.substr(5, 2), 16);
  }
  return rgbObj;
};

const toColorHex = c => `${c < 16 ? '0' : ''}${c.toString(16)}`;

export const rgbToString = function(RGBObj) {
  return `#${toColorHex(RGBObj.R)}${toColorHex(RGBObj.G)}${toColorHex(
    RGBObj.B
  )}`;
};

const floatToColor = color => Math.round(Math.max(Math.min(color, 255), 0));

const transformRGB = (colorString, fn) => {
  const RGB = stringToRGB(colorString);
  return rgbToString(
    Object.keys(RGB).reduce(
      (transRGB, c) => ({
        ...transRGB,
        [c]: fn(RGB[c]),
      }),
      {}
    )
  );
};

export const lighten = (colorString, percentage) =>
  transformRGB(colorString, c => floatToColor(c + 255 * percentage));

export const calculateColorGradient = (
  factor,
  minColor,
  maxColor,
  percentage,
  maxPercent = 1
) => {
  if (!percentage) {
    return minColor;
  }

  const maxRGB = stringToRGB(maxColor);
  const minRGB = stringToRGB(minColor);
  // Use of pow to make the gradient non linear
  const delta = Math.min((percentage / maxPercent) ** factor, 1);
  const fill = Object.keys(maxRGB).reduce(
    (acc, key) => ({
      ...acc,
      [key]: floatToColor(maxRGB[key] * delta + minRGB[key] * (1 - delta)),
    }),
    {}
  );

  return rgbToString(fill);
};
