import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import RuleButton from './rule_button';
import Button from '../utilities/button';
import SVGIcon from '../utilities/svg_icon';

import blockedIcon from '!raw-loader!../../../assets/blocked-nofill.svg'; // eslint-disable-line

import '../../../scss/rules/rules_button.scss';

const baseClass = 'rule-button';
const cSfx = sfx => `${baseClass}--${sfx}`;

const BlockButton = ({ className, showFullText, ...props }) => (
  <RuleButton type="blocked" {...props}>
    {({ active, actionPending, type, onToggle }) => (
      <span className="rule-button-wrapper rule-button-wrapper--blocked">
        {active &&
          showFullText && (
            <span className="rule-button__blocked">
              <SVGIcon
                svg={blockedIcon}
                className="rule-button__blocked__icon"
              />
              You blocked this {type}.
            </span>
          )}
        <Button
          disabled={actionPending}
          onClick={onToggle}
          className={cx(
            baseClass,
            className,
            `${className}--blocked`,
            { [cSfx('block')]: !active },
            { [cSfx('reset')]: active },
            { [cSfx('disabled')]: actionPending }
          )}
        >
          {active ? 'Undo' : 'Block'}
        </Button>
      </span>
    )}
  </RuleButton>
);

BlockButton.propTypes = {
  className: PropTypes.string,
  showFullText: PropTypes.bool,
};

BlockButton.defaultProps = {
  className: '',
  showFullText: true,
};

export default BlockButton;
