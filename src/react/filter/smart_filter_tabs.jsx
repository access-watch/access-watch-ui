import React from 'react';
import PropTypes from 'prop-types';

import SaveFilterGroup from './save_filter_group';

import {
  dispatch,
  V_SET_ROUTE,
  V_DELETE_FILTER_GROUP,
  V_REORDER_FILTER_GROUP,
  V_UPDATE_FILTER_GROUP,
} from '../../event_hub';
import { updateRouteParameter } from '../../utilities/route_utils';
import { routePropType, filterGroupsPropType } from '../prop_types';

import Tabs from '../utilities/tabs';

const autofocus = ref => {
  if (ref) {
    const { value } = ref;
    // put caret at the end
    ref.setSelectionRange(value.length, value.length);
    ref.focus();
  }
};

class SmartFilterTabs extends React.Component {
  static propTypes = {
    groupId: PropTypes.string.isRequired,
    filterGroups: filterGroupsPropType.isRequired,
    route: routePropType.isRequired,
  };

  state = {
    editLabel: {},
  };

  getFilterGroup = id => {
    const { filterGroups } = this.props;
    return id === 'default'
      ? { id: 'default', filter: '' }
      : filterGroups.find(fg => fg.id === id) || { id };
  };

  getCurrentFilterGroup = () => {
    const { filterGroupId } = this.props.route;
    return this.getFilterGroup(filterGroupId);
  };

  selectFilterGroup = ({ id, filter = '' }) => {
    const { route } = this.props;
    dispatch({
      type: V_SET_ROUTE,
      route: updateRouteParameter({
        route: updateRouteParameter({
          route: route.route,
          param: 'filterGroupId',
          value: id,
        }),
        param: 'filter',
        value: filter,
      }),
    });
  };

  selectTab = ({ id }) =>
    this.selectFilterGroup({ ...this.getFilterGroup(id) });

  handleTabClick = ({ id }) => {
    const filterGroup = this.getCurrentFilterGroup();
    const { editLabel } = this.state;
    if (id === filterGroup.id && !editLabel.id && id !== 'default') {
      this.setState({
        editLabel: {
          id,
          value: filterGroup.label,
        },
      });
    }
    if (id !== filterGroup.id) {
      this.selectTab({ id });
    }
  };

  editLabelValueChanged = ({ target: { value } }) => {
    const { editLabel } = this.state;
    this.setState({
      editLabel: {
        ...editLabel,
        value,
      },
    });
  };

  editLabelValueKeyPress = e => {
    if (e.key === 'Enter') {
      this.submitLabelValueChange();
      e.preventDefault();
      e.stopPropagation();
    }
  };

  submitLabelValueChange = () => {
    const { editLabel } = this.state;
    const { groupId } = this.props;
    const filterGroup = this.getCurrentFilterGroup();
    if (editLabel.value !== '' && editLabel.value !== filterGroup.label) {
      dispatch({
        type: V_UPDATE_FILTER_GROUP,
        filterGroup: {
          id: editLabel.id,
          label: editLabel.value,
        },
        groupId,
      });
    }
    this.setState({ editLabel: {} });
  };

  handleOrderChange = ({ oldIndex, newIndex }) => {
    const { groupId } = this.props;
    dispatch({ type: V_REORDER_FILTER_GROUP, oldIndex, newIndex, groupId });
  };

  deleteTab = ({ id }) => {
    const { groupId, filterGroups, route } = this.props;
    const { filterGroupId } = route;
    if (id === filterGroupId) {
      const index = filterGroups.findIndex(
        filterGroup => filterGroup.id === id
      );
      this.selectTab(index > 0 ? filterGroups[index - 1] : 'default');
    }
    dispatch({ type: V_DELETE_FILTER_GROUP, id, groupId });
  };

  render() {
    const { route, filterGroups, groupId, actionPending } = this.props;
    const { filterGroupId, filter } = route;
    const { editLabel } = this.state;
    const filterGroup = this.getCurrentFilterGroup();

    return (
      <div className="smart-filter-tabs">
        <Tabs
          tabs={[
            {
              id: 'default',
              children: 'All',
              notDraggable: true,
              notCloseable: true,
            },
            ...filterGroups.map(({ id, label = id }) => ({
              id,
              children:
                editLabel.id === id ? (
                  <input
                    className="smart-filter-tabs__edit"
                    value={editLabel.value}
                    onChange={this.editLabelValueChanged}
                    onBlur={this.submitLabelValueChange}
                    onKeyPress={this.editLabelValueKeyPress}
                    ref={autofocus}
                  />
                ) : (
                  label
                ),
            })),
          ]}
          currentTab={filterGroupId}
          onOrderChange={this.handleOrderChange}
          onTabClick={this.handleTabClick}
          onTabClose={this.deleteTab}
        />
        <SaveFilterGroup
          filter={filter}
          filterGroup={filterGroup}
          groupId={groupId}
          onlyCreateFilter
          onAddFilterGroup={this.selectFilterGroup}
          index={filterGroups.length + 1}
          actionPending={actionPending}
        >
          +
        </SaveFilterGroup>
      </div>
    );
  }
}

export default SmartFilterTabs;
