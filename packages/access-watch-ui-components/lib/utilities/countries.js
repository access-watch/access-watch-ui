import countryList from 'country-data/data/countries.json';

const countries = countryList.reduce((acc, el) => {
  if (el.status !== 'assigned' && el.status !== 'user assigned') {
    return acc;
  }
  acc[el.alpha2] = el;
  acc[el.alpha3] = el;
  return acc;
}, {});

countries.AG.name = countries.ATG.name = 'Antigua and Barbuda';
countries.BO.name = countries.BOL.name = 'Bolivia';
countries.BQ.name = countries.BES.name = 'Caribbean Netherlands';
countries.BY.name = countries.BLR.name = 'Belarus';
countries.IR.name = countries.IRN.name = 'Iran';
countries.KP.name = countries.PRK.name = 'North Korea';
countries.KR.name = countries.KOR.name = 'South Korea';
countries.LA.name = countries.LAO.name = 'Laos';
countries.MK.name = countries.MKD.name = 'Macedonia';
countries.PS.name = countries.PSE.name = 'Palestine';
countries.RU.name = countries.RUS.name = 'Russia';
countries.TL.name = countries.TLS.name = 'East Timor';
countries.SY.name = countries.SYR.name = 'Syria';
countries.TZ.name = countries.TZA.name = 'Tanzania';
countries.US.name = countries.USA.name = 'USA';
countries.VE.name = countries.VEN.name = 'Venezuela';
countries.VN.name = countries.VNM.name = 'Vietnam';

countries.EU = { name: 'Europe' };

// Potentially more controversial
// countries.CD.name = countries.COD.name = 'Congo-Kinshasa';
// countries.CG.name = countries.COG.name = 'Congo-Brazzaville';

const countriesFullName = Object.keys(countries).reduce(
  (acc, el) => ({
    ...acc,
    [el]: {...countries[el]}
  }), {}
);
countriesFullName.US.name = countriesFullName.USA.name = 'United States of America';

export {countriesFullName};

export default countries;

export const EUROPEAN_COUNTRY_CODES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK',
  'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'HR',
  'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
  'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
];

export const SPECIAL_VAT_COUNTRY_CODES = {
  'MC': {
    refCountry: 'FR'
  },
  'IM': {
    refCountry: 'GB'
  }
};
