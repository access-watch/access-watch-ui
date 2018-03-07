import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import RuleButton from './rule_button';
import Button from '../utilities/button';

import blockedIcon from '!raw-loader!../../../assets/blocked-nofill.svg'; // eslint-disable-line

import '../../../scss/rules/rules_button.scss';

const baseClass = 'rule-button';
const cSfx = sfx => `${baseClass}--${sfx}`;

const WhitelistButton = ({ className, showFullText, ...props }) => (
  <RuleButton type="whitelisted" {...props}>
    {({ active, actionPending, onToggle }) => (
      <span className="rule-button-wrapper rule-button-wrapper--whitelist">
        {active &&
          showFullText && (
            <span className="rule-button__blocked">Whitelisted</span>
          )}
        <Button
          disabled={actionPending}
          onClick={onToggle}
          className={cx(
            baseClass,
            className,
            cSfx('whitelist'),
            className ? `${className}--whitelist` : '',
            { [cSfx('block')]: !active },
            { [cSfx('reset')]: active },
            { [cSfx('disabled')]: actionPending }
          )}
        >
          {active ? 'Undo' : 'Whitelist'}
        </Button>
      </span>
    )}
  </RuleButton>
);

WhitelistButton.propTypes = {
  className: PropTypes.string,
  showFullText: PropTypes.bool,
};

WhitelistButton.defaultProps = {
  className: '',
  showFullText: true,
};

export default WhitelistButton;
