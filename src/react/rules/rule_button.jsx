import React from 'react';
import PropTypes from 'prop-types';

import { V_ADD_RULE, V_DELETE_RULE, dispatch } from '../../event_hub';
import RulePropTypes from './rule_prop_types';

import blockedIcon from '!raw-loader!../../../assets/blocked-nofill.svg'; // eslint-disable-line

class RuleButton extends React.Component {
  static propTypes = {
    condition: PropTypes.shape({
      type: PropTypes.string.isRequired,
    }),
    rule: PropTypes.shape(RulePropTypes),
    actionPending: PropTypes.bool,
    type: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired,
  };

  static defaultProps = {
    actionPending: false,
    rule: null,
    condition: null,
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
    const { rule, actionPending, children, condition, type } = this.props;
    return children({
      active: !!rule && rule.type === type,
      actionPending,
      type: (condition && condition.type) || rule.condition.type,
      onToggle: this.handleClick,
    });
  }
}

export default RuleButton;
