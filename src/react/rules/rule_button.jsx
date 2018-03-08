import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { V_ADD_RULE, V_DELETE_RULE, dispatch } from '../../event_hub';
import RulePropTypes from './rule_prop_types';
import Button from '../utilities/button';
import SVGIcon from '../utilities/svg_icon';

import '../../../scss/rules/rule_button.scss';

const baseClass = 'rule-button';
const cSfx = sfx => `${baseClass}--${sfx}`;

class RuleButton extends React.Component {
  static propTypes = {
    condition: PropTypes.shape({
      type: PropTypes.string.isRequired,
    }),
    rule: PropTypes.shape(RulePropTypes),
    actionPending: PropTypes.bool,
    type: PropTypes.string.isRequired,
    activeText: PropTypes.func,
    className: PropTypes.string,
    activeButtonText: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  };

  static defaultProps = {
    actionPending: false,
    rule: null,
    condition: null,
    activeText: ({ type, ruleType }) => `You ${ruleType} this ${type}.`,
    className: '',
  };

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    const { condition, rule, actionPending, type } = this.props;
    e.stopPropagation();
    if (!actionPending) {
      if (rule && rule.type === type) {
        dispatch({ type: V_DELETE_RULE, rule });
      } else {
        dispatch({
          type: V_ADD_RULE,
          rule: { ...(rule || {}), condition, type },
        });
      }
    }
  }

  render() {
    const {
      rule,
      actionPending,
      condition,
      type: ruleType,
      activeText,
      className,
      icon,
      activeButtonText,
    } = this.props;
    const active = !!rule && rule.type === ruleType;
    const type = (condition && condition.type) || rule.condition.type;
    return (
      <span className={`rule-button-wrapper rule-button-wrapper--${ruleType}`}>
        {active && (
          <span className="rule-button__active-text">
            <SVGIcon
              svg={icon}
              className={`rule-button__icon rule-button__icon--${ruleType}`}
            />
            {activeText({ type, ruleType })}
          </span>
        )}
        <Button
          disabled={actionPending}
          onClick={this.handleClick}
          className={cx(
            baseClass,
            className,
            cSfx(ruleType),
            className ? `${className}--${ruleType}` : '',
            { [cSfx('active')]: !active },
            { [cSfx('reset')]: active },
            { [cSfx('disabled')]: actionPending }
          )}
        >
          {active ? 'Undo' : activeButtonText}
        </Button>
      </span>
    );
  }
}

export default RuleButton;
