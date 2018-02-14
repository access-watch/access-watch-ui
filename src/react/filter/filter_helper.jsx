import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { filtersPropTypes, filtersDefaultProps } from './prop_types';

import '../../../scss/filter_helper.scss';

const generateFilterCn = (cn, f, val) =>
  cx(cn, `${cn}--${f.className}`, val ? `${cn}--${val.className}` : '');

const getFilter = (filters, id) => filters.find(f => f.id === id) || {};

const getFilterValues = (filters, id) => getFilter(filters, id).values || [];
const filterHasValue = (filters, id, value) =>
  getFilterValues(filters, id).indexOf(value) !== -1;

export default class FiltersLogs extends React.Component {
  static propTypes = {
    ...filtersPropTypes,
    onFilterClick: PropTypes.func.isRequired,
    onFilterValueClick: PropTypes.func.isRequired,
    onFiltersChanged: PropTypes.func.isRequired,
    onToggleEnabled: PropTypes.func,
    maxValuesDisplay: PropTypes.number,
  };

  static defaultProps = {
    ...filtersDefaultProps,
    onToggleEnabled: _ => _,
    maxValuesDisplay: 20,
  };

  state = {
    open: false,
  };

  switchOpen(val) {
    const newVal = typeof val === 'boolean' ? val : !this.state.open;
    this.setState({
      open: newVal,
    });
    if (newVal) {
      window.addEventListener('click', this.handleClose);
    } else {
      window.removeEventListener('click', this.handleClose);
    }
  }

  handleCurrentFiltersClick = e => {
    e.stopPropagation();
    this.switchOpen();
  };

  handleClose = _ => {
    this.switchOpen(false);
  };

  render() {
    const { open } = this.state;
    const {
      availableFilters,
      filters,
      onFilterClick,
      onFilterValueClick,
      maxValuesDisplay,
    } = this.props;

    return (
      <div className="filter_helper">
        <div
          className="filter_helper__btn"
          onClick={this.handleCurrentFiltersClick}
          onKeyPress={this.handleCurrentFiltersClick}
        >
          {open && (
            <div
              className="filter_helper__filters-panel"
              onClick={e => e.stopPropagation()}
              onKeyPress={e => e.stopPropagation()}
            >
              <div
                className="filter_helper__filters-panel__close-btn"
                onClick={this.handleClose}
                onKeyPress={this.handleClose}
              />
              <div className="filter_helper__filters-panel__title">
                Filter by
              </div>
              {availableFilters.map(
                ({
                  id,
                  label = id,
                  values = [],
                  valueToLabel = v => v,
                  fullText,
                }) => (
                  <div
                    key={id}
                    className="filter_helper__filters-panel__filter"
                  >
                    <button
                      className="filter_helper__filters-panel__filter-label"
                      onClick={e => {
                        e.stopPropagation();
                        onFilterClick({ id });
                        this.switchOpen();
                      }}
                    >
                      {label}
                    </button>
                    {values.length < maxValuesDisplay &&
                      values.map(value => (
                        <button
                          key={value}
                          className={cx(
                            generateFilterCn(
                              'filter_helper__filters-panel__filter-value',
                              id,
                              value
                            ),
                            {
                              'filter_helper__filters-panel__filter-value--active': filterHasValue(
                                filters,
                                id,
                                value
                              ),
                            }
                          )}
                          onClick={e => {
                            e.stopPropagation();
                            onFilterValueClick({ id, value });
                          }}
                        >
                          {valueToLabel(value)}
                        </button>
                      ))}
                    {(values.length === 0 ||
                      values.length >= maxValuesDisplay) && (
                      <div className="filter_helper__filters-panel__full-text">
                        {values.length === 0
                          ? `${fullText ? 'Full text f' : 'F'}ree typing`
                          : 'Too many possible values'}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
