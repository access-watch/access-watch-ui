import React from 'react';
import PropTypes from 'prop-types';

import { capitalize } from '../../utilities/string';
import { convertBackendKeysRecursive } from '../../utilities/object';

import RoundedTable from '../table/rounded_table';
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
  ...createSpeedResolvers({ id: 'blocked' }),
  ...createSpeedResolvers({ id: 'passed' }),
  {
    id: 'created',
    // eslint-disable-next-line
    resolver: ({ created }) => <TimeAgo time={new Date(created * 1000)} />,
  },
  {
    id: 'remove',
    label: '',
    resolver: rule => (
      <RuleButton rule={rule} className="rules__rule__remove-btn" />
    ),
  },
];

const EXPORTS_OPTIONS = ['nginx', 'apache'];

const RulesPage = ({ rules }) => {
  const rulesValues = Object.values(rules.rules);
  return (
    <div className="rules">
      <div className="rules__title">Rules</div>
      <div className="rules__export">
        Export :
        {EXPORTS_OPTIONS.map(id => <ExportButton id={id} key={id} />)}
      </div>
      {rulesValues.length > 0 && (
        <RoundedTable entries={rulesValues} resolvers={rulesResolvers} />
      )}
      {rulesValues.length === 0 && (
        <div className="rules__empty">No rules have been set.</div>
      )}
    </div>
  );
};

RulesPage.propTypes = {
  rules: PropTypes.shape({
    rules: PropTypes.object.isRequired,
  }).isRequired,
};

RulesPage.defaultProps = {
  statusLoading: false,
};

export default RulesPage;
