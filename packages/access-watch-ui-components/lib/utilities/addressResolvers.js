import { capitalize } from './string';

export const typeOrder = [
  'tor',
  'vpn',
  'proxy',
  'crawler',
  'robot',
  'cloud',
  'dedicated',
  'shared',
  'server',
  'vps',
  'corporate',
  'business',
  'institution',
  'education',
  'mobile',
  'wifi',
  'wimax',
  'sat',
  'dialup',
  'cable',
  'dsl',
  'fiber',
  'broadband',
];

export const addressTypeResolver = ({ flags }) => {
  if (flags && flags.length) {
    const type = typeOrder.find(t => flags.indexOf(t) !== -1);
    if (type) {
      return capitalize(type);
    }
    return capitalize(flags[0]);
  }
  return 'Unknown';
};
