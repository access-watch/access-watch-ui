import React from 'react';
import PropTypes from 'prop-types';

import flags1x from './flags1x.png';
import flags2x from './flags2x.png';
import flags3x from './flags3x.png';

import './FlagIcon.scss';

// this is the order of the flags in the sprite sheet
/* eslint-disable prettier/prettier */
const ccs = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AN', 'AO', 'AQ', 'AR', 'AS', 'AT',
  'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ',
  'BL', 'BM', 'BN', 'BO', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD',
  'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CT', 'CU', 'CV',
  'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG',
  'EH', 'ER', 'ES', 'ET', 'EU', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB',
  'GD', 'GE', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GQ', 'GR', 'GS', 'GT', 'GU',
  'GW', 'GY', 'HK', 'HN', 'HR', 'HT', 'HU', 'IC', 'ID', 'IE', 'IL', 'IM', 'IN',
  'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM',
  'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS',
  'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML',
  'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY',
  'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ',
  'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PN', 'PR', 'PS', 'PT', 'PW',
  'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG',
  'SH', 'SI', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY',
  'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR',
  'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG',
  'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
];
/* eslint-enable prettier/prettier */

const sizes = {
  s: 16,
  m: 32,
  l: 64,
};

const flagsSrc = {
  s: flags1x,
  m: flags2x,
  l: flags3x,
};

const FlagIcon = ({ cc, title, size, className }) => {
  const pos = -ccs.indexOf(cc.toUpperCase()) * sizes[size];
  return (
    <span className={`flag-icon flag-icon--${size} ${className}`}>
      <img
        alt={cc}
        title={title}
        src={flagsSrc[size]}
        style={{
          marginTop: pos,
          height: 'auto',
        }}
      />
    </span>
  );
};

FlagIcon.propTypes = {
  cc: PropTypes.string.isRequired,
  title: PropTypes.string,
  size: PropTypes.oneOf(['s', 'm', 'l']),
  className: PropTypes.string,
};

FlagIcon.defaultProps = {
  title: '',
  size: 's',
  className: '',
};

export default FlagIcon;
