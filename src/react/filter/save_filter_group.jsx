import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';

import { filterGroupPropType } from '../prop_types';

import {
  dispatch,
  V_ADD_FILTER_GROUP,
  V_UPDATE_FILTER_GROUP,
} from '../../event_hub';

import '../../../scss/save_filter_group.scss';

const saveFilterGroup = ({
  filterGroup,
  filter,
  groupId,
  label,
  onAddFilterGroup,
}) => {
  if (filterGroup.id) {
    dispatch({
      type: V_UPDATE_FILTER_GROUP,
      filterGroup: {
        ...filterGroup,
        filter,
      },
      groupId,
    });
  } else {
    const newFilterGroup = { id: uuid(), label, filter };
    dispatch({
      type: V_ADD_FILTER_GROUP,
      filterGroup: newFilterGroup,
      groupId,
    });
    onAddFilterGroup(newFilterGroup);
  }
};

class SaveFilterGroup extends React.Component {
  static propTypes = {
    filterGroup: filterGroupPropType.isRequired,
    filter: PropTypes.string.isRequired,
    groupId: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    onlyCreateFilter: PropTypes.bool,
    onAddFilterGroup: PropTypes.func,
    index: PropTypes.number.isRequired,
    actionPending: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    onlyCreateFilter: false,
    onAddFilterGroup: _ => _,
  };

  state = {
    actionPending: null,
  };

  componentWillReceiveProps({ actionPending, filterGroup }) {
    if (
      this.state.actionPending &&
      actionPending === false &&
      filterGroup.id !== this.state.actionPending
    ) {
      this.setState({ actionPending: false });
    }
  }

  saveFilter = () => {
    const {
      filterGroup,
      filter,
      groupId,
      onlyCreateFilter,
      onAddFilterGroup,
      index,
    } = this.props;
    const { actionPending } = this.state;
    if (!actionPending) {
      if (onlyCreateFilter || !filterGroup.id) {
        const label = filterGroup.label
          ? `${filterGroup.label} copy`
          : `Search #${index}`;
        saveFilterGroup({
          groupId,
          filter,
          filterGroup: {},
          label,
          onAddFilterGroup,
        });
      } else {
        saveFilterGroup({ filterGroup, groupId, filter, onAddFilterGroup });
      }
      this.setState({ actionPending: filterGroup.id });
    }
  };

  render() {
    const { children } = this.props;
    const { actionPending } = this.state;
    return (
      <button
        className="save-filter-group"
        disabled={actionPending}
        onClick={this.saveFilter}
      >
        {children}
      </button>
    );
  }
}

export default SaveFilterGroup;
