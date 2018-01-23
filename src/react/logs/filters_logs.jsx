import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { capitalize } from '../../utilities/string';

import ToggleButton from '../utilities/toggle_button';

import '../../../scss/logs-filters.scss';
import blockIcon from '!raw-loader!../../../assets/blocked-nofill.svg'; //eslint-disable-line

const typeFilters = { browser: { label: 'Human' }, robot: {} };
const reputationFilters = ['nice', 'ok', 'suspicious', 'bad'];
const methodFilters = ['HEAD', 'GET', 'POST', 'PUT', 'DELETE'];
const statusFilters = ['200', '301', '302', '403', '404', '500', '503'];

const createStandardFilter = i => ({
  label: capitalize('' + i),
  className: '' + i,
  value: i,
});

const createStandardFiltersFromArray = arr =>
  arr.reduce(
    (acc, i) => ({
      ...acc,
      [i]: createStandardFilter(i),
    }),
    {}
  );

const createFiltersFromObject = obj =>
  Object.keys(obj).reduce(
    (acc, i) => ({
      ...acc,
      [i]: {
        ...createStandardFilter(i),
        ...obj[i],
      },
    }),
    {}
  );

const Filters = {
  'identity.type': {
    label: 'Type',
    className: 'type',
    unique: true,
    values: { ...createFiltersFromObject(typeFilters) },
  },
  'reputation.status': {
    label: 'Reputation',
    className: 'reputation',
    values: { ...createStandardFiltersFromArray(reputationFilters) },
  },
  'request.method': {
    label: 'Method',
    values: { ...createStandardFiltersFromArray(methodFilters) },
  },
  'response.status': {
    label: 'Status',
    values: { ...createStandardFiltersFromArray(statusFilters) },
  },
};

const generateFilterCn = (cn, f, val) =>
  cx(cn, `${cn}--${f.className}`, val ? `${cn}--${val.className}` : '');

export default class FiltersLogs extends React.Component {
  static propTypes = {
    currentFilters: PropTypes.objectOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.array])
    ),
    onFiltersChanged: PropTypes.func.isRequired,
    enabled: PropTypes.bool,
    onToggleEnabled: PropTypes.func,
  };

  static defaultProps = {
    currentFilters: {},
    enabled: true,
    onToggleEnabled: _ => _,
  };

  state = {
    open: false,
  };

  getInternalCurrentFilters() {
    const { currentFilters } = this.props;
    const internalKeys = Object.keys(Filters);
    return currentFilters
      ? Object.keys(currentFilters)
          .sort((k1, k2) => internalKeys.indexOf(k1) - internalKeys.indexOf(k2))
          .reduce(
            (acc, k) => ({
              ...acc,
              [k]: Filters[k].unique
                ? [currentFilters[k].join(',')]
                : currentFilters[k],
            }),
            {}
          )
      : null;
  }

  handleFilterChanged = (filterType, filter) => {
    const newFilters = this.getInternalCurrentFilters() || {};
    const { value } = filter;
    let filterModify =
      newFilters && newFilters[filterType] ? [...newFilters[filterType]] : [];
    const indexOfVal = filterModify.indexOf(value);
    const allValues = Object.keys(Filters[filterType].values);

    if (indexOfVal !== -1) {
      filterModify.splice(indexOfVal, 1);
    } else {
      if (Filters[filterType].unique) {
        filterModify = [];
      }
      if (typeof value === 'string') {
        filterModify = filterModify.concat(value.split(','));
      } else {
        filterModify.push(value);
      }
    }

    newFilters[filterType] = filterModify.sort(
      (a, b) => allValues.indexOf(a) - allValues.indexOf(b)
    );

    this.props.onFiltersChanged(newFilters);
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

  toggleEnabled = _ => {
    if (this.getInternalCurrentFilters()) {
      this.props.onToggleEnabled();
    }
  };

  render() {
    const internalCurrentFilters = this.getInternalCurrentFilters();
    const { open } = this.state;
    const { enabled } = this.props;

    return (
      <div
        className={`logs-filter logs-filter--${
          enabled ? 'enabled' : 'disabled'
        }`}
      >
        <div
          className="logs-filter__btn"
          onClick={this.handleCurrentFiltersClick}
          onKeyPress={this.handleCurrentFiltersClick}
        >
          {open && (
            <div
              className="logs-filter__filters-panel"
              onClick={e => e.stopPropagation()}
              onKeyPress={e => e.stopPropagation()}
            >
              <div
                className="logs-filter__filters-panel__close-btn"
                onClick={this.handleClose}
                onKeyPress={this.handleClose}
              />
              <div className="logs-filter__filters-panel__title">Filter by</div>
              {Object.keys(Filters).map(k => (
                <div key={k} className="logs-filter__filters-panel__filter">
                  <div className="logs-filter__filters-panel__filter-label">
                    {Filters[k].label}
                  </div>
                  {Object.keys(Filters[k].values)
                    .map(filterKey => [filterKey, Filters[k].values[filterKey]])
                    .map(([filterKey, filter]) => (
                      <div
                        key={filterKey}
                        className={cx(
                          generateFilterCn(
                            'logs-filter__filters-panel__filter-value',
                            Filters[k],
                            filter
                          ),
                          {
                            'logs-filter__filters-panel__filter-value--active':
                              internalCurrentFilters &&
                              internalCurrentFilters[k] &&
                              internalCurrentFilters[k].indexOf(
                                filter.value
                              ) !== -1,
                          }
                        )}
                        onClick={e => {
                          e.stopPropagation();
                          this.handleFilterChanged(k, filter);
                        }}
                        onKeyPress={e => {
                          e.stopPropagation();
                          this.handleFilterChanged(k, filter);
                        }}
                      >
                        {filter.label}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="logs-filter__current-filters">
          {internalCurrentFilters &&
            Object.keys(internalCurrentFilters).map(k => (
              <div
                key={k}
                className={generateFilterCn(
                  'logs-filter__current-filters__filter',
                  Filters[k]
                )}
              >
                {internalCurrentFilters[k].map(filter => (
                  <div
                    key={`${k}_${filter}`}
                    className={generateFilterCn(
                      'logs-filter__current-filters__filter-value',
                      Filters[k],
                      Filters[k].values[filter]
                    )}
                  >
                    {Filters[k].values[filter].label}
                    <span
                      className="logs-filter__current-filters__filter-value-remove-container"
                      onClick={e => {
                        e.stopPropagation();
                        this.handleFilterChanged(k, Filters[k].values[filter]);
                      }}
                      onKeyPress={e => {
                        e.stopPropagation();
                        this.handleFilterChanged(k, Filters[k].values[filter]);
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
        </div>
        <div className="logs-filter__switch">
          <div className="logs-filter__switch__text">
            {internalCurrentFilters &&
              `Filters ${enabled ? 'enabled' : 'disabled'}`}
            {!internalCurrentFilters && 'No filters'}
          </div>
          <ToggleButton
            className={cx('logs-filter__switch-btn', {
              'logs-filter__switch-btn--no-filters': !internalCurrentFilters,
            })}
            enabled={enabled && !!internalCurrentFilters}
            onClick={this.toggleEnabled}
          />
        </div>
      </div>
    );
  }
}
