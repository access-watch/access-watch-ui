import React from 'react';
import PropTypes from 'prop-types';

import Pill from '../Pill';
import Autocomplete from '../Autocomplete';

import './SmartFilter.scss';

const getElementClass = b => e => `${b}__${e}`;
const baseClass = 'smart-filter';
const beBc = getElementClass(baseClass);
const itemClass = beBc('item');
const getItemElementClass = getElementClass(itemClass);
const itemValuesClass = getItemElementClass('values');
const itemIdClass = getItemElementClass('id');
const itemValueClass = getItemElementClass('value');
const itemPlaceholderClass = getItemElementClass('placeholder');
const itemValueWrapperClass = `${itemValueClass}-wrapper`;

const classNameFriendly = str => str.replace('.', '-');
const getClassName = base => ({ id, value }) => {
  const compose = s => `${base}--${classNameFriendly(s)}`;
  return `${base} ${compose(id)} ${compose(value)}`;
};

const isEditedValue = (edit, id, value) =>
  edit.id === id && edit.value === value;

const arrayDifference = (a, b) => a.filter(i => b.indexOf(i) === -1);
const getAvailableValues = (filters, availableFilters, filter) => {
  const { values = [] } = filters.find(f => f.id === filter.id);
  const filterDef = availableFilters.find(f => f.id === filter.id);
  const { values: availableValues = [] } = filterDef;
  return arrayDifference(
    availableValues,
    values.filter(v => v !== filter.value)
  ).map(value => {
    const { valueToLabel = v => v } = filterDef;
    return {
      value,
      label: valueToLabel(value),
    };
  });
};

const autoFocus = ref => {
  if (ref) {
    const { value } = ref;
    // put caret at the end
    ref.setSelectionRange(value.length, value.length);
    ref.focus();
  }
};

const displayFilterValue = ({ availableFilters, id, value }) => {
  const { valueToLabel = v => v } = availableFilters.find(f => f.id === id);
  return valueToLabel(value);
};

const displayFilterLabel = ({ availableFilters, id }) =>
  availableFilters.find(f => f.id === id).label || id;

class SmartFilter extends React.Component {
  static propTypes = {
    filters: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        values: PropTypes.arrayOf(
          PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        ),
      })
    ).isRequired,
    availableFilters: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        values: PropTypes.arrayOf(
          PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        ),
      })
    ),
    selectedFilter: PropTypes.string,
    onUnselectFilter: PropTypes.func,
  };

  state = {
    editFilter: {},
    addFilter: false,
    selectedFilter: null,
    onUnselectFilter: _ => _,
  };

  componentWillReceiveProps({ selectedFilter }) {
    const { editFilter } = this.state;
    if (selectedFilter && selectedFilter !== editFilter.id) {
      this.setState({ editFilter: { id: selectedFilter } });
    }
  }

  componentDidMount() {
    window.addEventListener('click', () => {
      const { onUnselectFilter } = this.props;
      onUnselectFilter();
      this.setState({ editFilter: {}, addFilter: false });
    });
  }

  deleteFilterValue = ({ id, value, updateState = true }) => e => {
    const { filters, onDeleteFilterValue } = this.props;
    const { editFilter } = this.state;
    const { values = [] } = filters.find(f => f.id === id);
    e.stopPropagation();
    if (values.length <= 1) {
      this.deleteFilter({ id })(e);
    } else {
      onDeleteFilterValue({ id, value });
      if (
        editFilter.id === id &&
        (editFilter.value === value || !value) &&
        updateState
      ) {
        this.setState({ editFilter: {} });
      }
    }
  };

  deleteFilter = ({ id }) => e => {
    const { editFilter } = this.state;
    const { onDeleteFilter } = this.props;
    e.stopPropagation();
    onDeleteFilter({ id });
    if (editFilter.id === id) {
      this.setState({ editFilter: {} });
    }
  };

  handleFilterClick = ({ id, value }) => e => {
    const { filters, availableFilters } = this.props;
    const { values = [] } = filters.find(f => f.id === id);
    const { values: availableValues = [] } = availableFilters.find(
      f => f.id === id
    );
    const editFilter = { id };
    e.stopPropagation();
    if (value) {
      editFilter.value = value;
    } else {
      if (values.length === availableValues.length) {
        editFilter.value = values[values.length - 1];
      }
    }
    this.setState({
      editFilter,
    });
  };

  handleFilterValueChange = ({ id, value: oldValue }) => ({
    value: newValue,
  }) => {
    const { onFilterValueChange } = this.props;
    onFilterValueChange({ id, newValue, oldValue });
    this.setState({ editFilter: {} });
  };

  handleInputKeyDown = ({ id, value }) => (e, { reset, highlightedItem }) => {
    const { availableFilters, filters } = this.props;
    const { key, target: { value: inputValue } } = e;
    const { values: availableValues } = availableFilters.find(f => f.id === id);
    const isFullText = !availableValues;
    const { values = [] } = filters.find(f => f.id === id);
    const autoCompleteKeys = ['Enter', 'Tab', ' '];
    if (key === 'Backspace' && inputValue === '') {
      const index = value ? values.indexOf(value) : values.length;
      if (value) {
        this.deleteFilterValue({ id, value, updateState: false })(e);
      } else if (values.length === 0) {
        this.deleteFilter({ id })(e);
      }
      if (index > 0) {
        this.setState({
          editFilter: {
            id,
            value: values[index - 1],
          },
        });
      } else {
        this.setState({ editFilter: {} });
      }
      e.preventDefault();
      return;
    }
    if (autoCompleteKeys.indexOf(key) !== -1) {
      const hasValidValue = isFullText || highlightedItem;
      if (hasValidValue) {
        if (isFullText && inputValue.length > 0) {
          this.handleFilterValueChange({ id, value })({ value: inputValue });
        } else if (highlightedItem) {
          this.handleFilterValueChange({ id, value })(highlightedItem);
        }
        reset();
        e.preventDefault();
        if (
          key === ' ' &&
          (isFullText || values.length < availableValues.length - 1)
        ) {
          this.setState({ editFilter: { id } });
        } else if (key === ' ' || key === 'Tab') {
          this.setState({ editFilter: {}, addFilter: true });
        } else {
          this.setState({ editFilter: {} });
        }
      }
    }
  };

  handleFilterInputKeyDown = (e, { reset, highlightedItem }) => {
    const { availableFilters } = this.props;
    const { key, target: { value: inputValue } } = e;
    const valueIndex = availableFilters.findIndex(f => f.label === inputValue);
    if (key === ':' && valueIndex !== -1) {
      e.preventDefault();
      this.onAddFilter({ value: availableFilters[valueIndex].id });
    }
  };

  onAddFilter = ({ value: id }) => {
    this.setState({ editFilter: { id }, addFilter: false });
    this.props.onAddFilter({ id });
  };

  setAddFilter = e => {
    e.stopPropagation();
    this.setState({ addFilter: true });
  };

  onOuterClick = () => {
    const { onUnselectFilter } = this.props;
    onUnselectFilter();
    this.setState({ editFilter: {} });
  };

  render() {
    const { filters, availableFilters } = this.props;
    const { editFilter, addFilter } = this.state;
    const addingFilterValue =
      Object.keys(editFilter).length !== 0 && !editFilter.value;
    const canAddFilter =
      filters.length < availableFilters.length && !addingFilterValue;
    return (
      <div className={baseClass}>
        {filters.map(({ id, label = id, values = [] }) => (
          <Pill
            className={itemClass}
            onClick={this.handleFilterClick({ id })}
            onDelete={this.deleteFilter({ id })}
            key={id}
          >
            <div className={itemIdClass}>
              {displayFilterLabel({ availableFilters, id })}
            </div>
            :
            <div className={itemValuesClass}>
              {values.map(value => (
                <div key={value} className={itemValueWrapperClass}>
                  <Pill
                    className={getClassName(itemValueClass)({ id, value })}
                    onClick={this.handleFilterClick({ id, value })}
                    onDelete={this.deleteFilterValue({ id, value })}
                  >
                    {isEditedValue(editFilter, id, value) ? (
                      <Autocomplete
                        items={getAvailableValues(filters, availableFilters, {
                          id,
                          value,
                        })}
                        onChange={this.handleFilterValueChange({ id, value })}
                        selectedItem={value}
                        inputRef={autoFocus}
                        onKeyDown={this.handleInputKeyDown({ id, value })}
                        onOuterClick={this.onOuterClick}
                      />
                    ) : (
                      displayFilterValue({ availableFilters, id, value })
                    )}
                  </Pill>
                </div>
              ))}
              {addingFilterValue &&
                editFilter.id === id && (
                  <Autocomplete
                    items={getAvailableValues(filters, availableFilters, {
                      id,
                    })}
                    onChange={this.handleFilterValueChange({ id })}
                    inputRef={autoFocus}
                    onKeyDown={this.handleInputKeyDown({ id })}
                    onOuterClick={this.onOuterClick}
                  />
                )}
            </div>
          </Pill>
        ))}
        {canAddFilter &&
          (addFilter ? (
            <Autocomplete
              items={arrayDifference(
                availableFilters.map(({ id }) => id),
                filters.map(({ id }) => id)
              ).map(id => ({
                value: id,
                label: displayFilterLabel({ availableFilters, id }),
              }))}
              onChange={this.onAddFilter}
              inputRef={autoFocus}
              onKeyDown={this.handleFilterInputKeyDown}
              onOuterClick={this.onOuterClick}
            />
          ) : (
            <div className={itemPlaceholderClass} onClick={this.setAddFilter}>
              Add filter
            </div>
          ))}
      </div>
    );
  }
}

export default SmartFilter;
