import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';

import { searchPropType } from '../prop_types';

import {
  dispatch,
  V_ADD_SEARCH,
  V_UPDATE_SEARCH,
} from '../../event_hub';

import '../../../scss/save_search.scss';

const saveSearch = ({
  search,
  filter,
  groupId,
  label,
  onAddSearch,
}) => {
  if (search.id) {
    dispatch({
      type: V_UPDATE_SEARCH,
      search: {
        ...search,
        filter,
      },
      groupId,
    });
  } else {
    const newSearch = { id: uuid(), label, filter };
    dispatch({
      type: V_ADD_SEARCH,
      search: newSearch,
      groupId,
    });
    onAddSearch(newSearch);
  }
};

class SaveSearch extends React.Component {
  static propTypes = {
    search: searchPropType.isRequired,
    filter: PropTypes.string.isRequired,
    groupId: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    onlyCreateFilter: PropTypes.bool,
    onAddSearch: PropTypes.func,
    index: PropTypes.number.isRequired,
    actionPending: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    onlyCreateFilter: false,
    onAddSearch: _ => _,
  };

  state = {
    actionPending: null,
  };

  componentWillReceiveProps({ actionPending, search }) {
    if (
      this.state.actionPending &&
      actionPending === false &&
      search.id !== this.state.actionPending
    ) {
      this.setState({ actionPending: false });
    }
  }

  saveFilter = () => {
    const {
      search,
      filter,
      groupId,
      onlyCreateFilter,
      onAddSearch,
      index,
    } = this.props;
    const { actionPending } = this.state;
    if (!actionPending) {
      if (onlyCreateFilter || !search.id) {
        const label = search.label
          ? `${search.label} copy`
          : `Search #${index}`;
        saveSearch({
          groupId,
          filter,
          search: {},
          label,
          onAddSearch,
        });
      } else {
        saveSearch({ search, groupId, filter, onAddSearch });
      }
      this.setState({ actionPending: search.id });
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

export default SaveSearch;
