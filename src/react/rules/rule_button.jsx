import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { V_ADD_RULE, V_REMOVE_RULE, dispatch } from '../../event_hub';

import Button from '../utilities/button';
import SVGIcon from '../utilities/svg_icon';
import RulePropTypes from './rule_prop_types';

import blockedIcon from '!raw-loader!../../../assets/blocked-nofill.svg'; // eslint-disable-line

import '../../../scss/rules/rules_button.scss';

const baseClass = 'rule-button';
const cSfx = sfx => `${baseClass}--${sfx}`;

class RuleButton extends React.Component {
  static propTypes = {
    // FIXME : For now value can be any object matching a rule
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.object,
    rule: PropTypes.shape(RulePropTypes),
    actionPending: PropTypes.bool,
    type: PropTypes.string,
    className: PropTypes.string,
    showBlockedText: PropTypes.bool,
  };

  static defaultProps = {
    value: null,
    actionPending: false,
    rule: null,
    type: null,
    className: '',
    showBlockedText: true,
  };

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { value, rule, actionPending, type } = this.props;
    if (!actionPending) {
      if (rule) {
        dispatch({ type: V_REMOVE_RULE, rule });
      } else {
        dispatch({
          type: V_ADD_RULE,
          rule: { condition: { type, value }, type: 'blocked' },
        });
      }
    }
  }

  render() {
    const {
      rule,
      actionPending,
      className,
      type,
      showBlockedText,
      ...props
    } = this.props;
    const label = rule ? 'Undo' : 'Block';
    return (
      <span className="rule-button-wrapper">
        {rule &&
          showBlockedText && (
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
          onClick={this.handleClick}
          className={cx(
            baseClass,
            className,
            { [cSfx('block')]: !rule },
            { [cSfx('reset')]: !!rule },
            { [cSfx('disabled')]: actionPending }
          )}
          {...props}
        >
          {label}
        </Button>
      </span>
    );
  }
}

export default RuleButton;
