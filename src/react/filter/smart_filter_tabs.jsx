import React from 'react';
import PropTypes from 'prop-types';

import SaveSearch from './save_search';

import {
  dispatch,
  V_SET_ROUTE,
  V_DELETE_SEARCH,
  V_REORDER_SEARCH,
  V_UPDATE_SEARCH,
} from '../../event_hub';
import { updateRouteParameter } from '../../utilities/route_utils';
import { routePropType, searchPropType } from '../prop_types';

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
    searches: PropTypes.arrayOf(searchPropType).isRequired,
    route: routePropType.isRequired,
    actionPending: PropTypes.bool.isRequired,
  };

  state = {
    editLabel: {},
  };

  getSearch = id => {
    const { searches } = this.props;
    return id === 'default'
      ? { id: 'default', filter: '' }
      : searches.find(fg => fg.id === id) || { id };
  };

  getCurrentSearch = () => {
    const { searchId } = this.props.route;
    return this.getSearch(searchId);
  };

  selectSearch = ({ id, filter = '' }) => {
    const { route } = this.props;
    dispatch({
      type: V_SET_ROUTE,
      route: updateRouteParameter({
        route: updateRouteParameter({
          route: route.route,
          param: 'searchId',
          value: id,
        }),
        param: 'filter',
        value: filter,
      }),
    });
  };

  selectTab = ({ id }) =>
    this.selectSearch({ ...this.getSearch(id) });

  handleTabClick = ({ id }) => {
    const search = this.getCurrentSearch();
    const { editLabel } = this.state;
    if (id === search.id && !editLabel.id && id !== 'default') {
      this.setState({
        editLabel: {
          id,
          value: search.label,
        },
      });
    }
    if (id !== search.id) {
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
    const search = this.getCurrentSearch();
    if (editLabel.value !== '' && editLabel.value !== search.label) {
      dispatch({
        type: V_UPDATE_SEARCH,
        search: {
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
    dispatch({ type: V_REORDER_SEARCH, oldIndex, newIndex, groupId });
  };

  deleteTab = ({ id }) => {
    const { groupId, searches, route } = this.props;
    const { searchId } = route;
    if (id === searchId) {
      const index = searches.findIndex(
        search => search.id === id
      );
      this.selectTab(index > 0 ? searches[index - 1] : 'default');
    }
    dispatch({ type: V_DELETE_SEARCH, id, groupId });
  };

  render() {
    const { route, searches, groupId, actionPending } = this.props;
    const { searchId, filter } = route;
    const { editLabel } = this.state;
    const search = this.getCurrentSearch();

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
            ...searches.map(({ id, label = id }) => ({
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
          currentTab={searchId}
          onOrderChange={this.handleOrderChange}
          onTabClick={this.handleTabClick}
          onTabClose={this.deleteTab}
        />
        <SaveSearch
          filter={filter}
          search={search}
          groupId={groupId}
          onlyCreateFilter
          onAddSearch={this.selectSearch}
          index={searches.length + 1}
          actionPending={actionPending}
        >
          +
        </SaveSearch>
      </div>
    );
  }
}

export default SmartFilterTabs;
