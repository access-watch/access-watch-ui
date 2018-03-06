import React from 'react';
import PropTypes from 'prop-types';

import { capitalize } from '../../utilities/string';
import { convertBackendKeysRecursive } from '../../utilities/object';
import { updateRouteParameter } from '../../utilities/route_utils';
import { dispatch, V_SET_ROUTE } from '../../event_hub';
import { routePropType } from '../prop_types';

import Table from '../table/table';
import TimeAgo from '../utilities/time_ago';
import RuleButton from '../rules/rule_button';
import createSpeedResolvers from '../activity/speed_resolver';
import ConditionDisplay from '../rules/condition_display';
import ExportButton from '../rules/export_button';

import '../../../scss/rules_page.scss';

const typeToLabel = ({ type }) => capitalize(type);

const rulesResolvers = [
  {
    id: 'type',
    resolver: ({ condition }) => typeToLabel(condition),
  },
  {
    id: 'value',
    // eslint-disable-next-line
    resolver: ({ condition }) => (
      <ConditionDisplay condition={convertBackendKeysRecursive(condition)} />
    ),
  },
  ...createSpeedResolvers({ id: 'blocked', sortable: true }),
  ...createSpeedResolvers({ id: 'passed', sortable: true }),
  {
    id: 'last_hit',
    label: 'Last hit',
    // eslint-disable-next-line
    resolver: ({ last_hit: lastHit }) =>
      lastHit ? <TimeAgo time={new Date(lastHit * 1000)} /> : '',
    sortable: true,
  },
  {
    id: 'created',
    // eslint-disable-next-line
    resolver: ({ created }) => <TimeAgo time={new Date(created * 1000)} />,
    sortable: true,
  },
  {
    id: 'remove',
    label: '',
    resolver: rule => (
      <RuleButton
        rule={rule}
        className="rules__rule__remove-btn"
        showBlockedText={false}
      />
    ),
  },
];

const EXPORTS_OPTIONS = ['nginx', 'apache', 'txt'];

class RulesPage extends React.Component {
  static propTypes = {
    rules: PropTypes.shape({
      rules: PropTypes.object.isRequired,
    }).isRequired,
    route: routePropType.isRequired,
  };

  static defaultProps = {
    statusLoading: false,
  };

  openDetails = id => {
    const { rules, route } = this.props;
    const rule = rules.rules[id];
    dispatch({
      type: V_SET_ROUTE,
      route: `rules/${rule.id}?sort=${route.sort}`,
    });
  };

  handleSortChange = sort => {
    const { route } = this.props;
    dispatch({
      type: V_SET_ROUTE,
      route: updateRouteParameter({
        route: route.route,
        param: 'sort',
        value: sort,
      }),
    });
  };

  render() {
    const { rules, route } = this.props;
    const { sort } = route;
    const rulesValues = Object.values(rules.rules).sort((a, b) => {
      if (sort.indexOf('passed') === 0 || sort.indexOf('blocked') === 0) {
        const sortIsActivity = sort.indexOf('Activity') !== -1;
        const sortId = sort.slice(
          0,
          sort.length - (sortIsActivity ? 'Activity'.length : '')
        );
        const getValue = speed =>
          speed[sortId][sortIsActivity ? 'speed' : 'count'];
        return getValue(b) - getValue(a);
      }
      return (b[sort] || 0) - (a[sort] || 0);
    });
    return (
      <div className="rules">
        <div className="page-header page-header--robots">
          <div className="page-header__header">
            <span className="page-header__header-title">Rules</span>
          </div>
          <div
            className="page-header__body"
            style={{ flexDirection: 'column', justifyContent: 'flex-end' }}
          >
            <div className="rules__export">
              Export :
              {EXPORTS_OPTIONS.map(id => <ExportButton id={id} key={id} />)}
            </div>
          </div>
        </div>
        {rulesValues.length > 0 && (
          <Table
            entries={rulesValues}
            resolvers={rulesResolvers}
            onEntryClick={this.openDetails}
            currentSort={sort}
            onSortChange={this.handleSortChange}
          />
        )}
        {rulesValues.length === 0 && (
          <div className="rules__empty">No rules have been set.</div>
        )}
      </div>
    );
  }
}

export default RulesPage;
