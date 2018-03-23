import React from 'react';
import PropTypes from 'prop-types';
import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';

import { getStatusType, getWorstStatus } from './utils';

import './SubscriptionSummary.scss';

const capitalize = w => w[0].toUpperCase() + w.slice(1).toLowerCase();

const getRemainingDays = subscription =>
  differenceInCalendarDays(subscription.trial_expires, Date.now());

const PLAN_STATUS_TEXT = {
  sites_exceeded: 'Site limit exceeded!',
  requests_exceeded: 'Monthly request limit exceeded!',
  requests_critical: 'Approaching monthly request limit!',
};

const SubscriptionSummary = ({ subscription, onUpgradeClicked }) => {
  const worstStatus =
    subscription.status &&
    subscription.status.length &&
    getWorstStatus(subscription);
  return (
    <div className="subscription-summary">
      {// Trial message deactivated
      subscription.is_trial &&
        false && (
          <span>
            {getRemainingDays(subscription)} day{getRemainingDays(
              subscription
            ) > 1 && 's'}{' '}
            remaining of your free {capitalize(subscription.plan)} trial.
            <button
              className="subscription-summary__update-link"
              onClick={onUpgradeClicked}
            >
              Upgrade now
            </button>
          </span>
        )}
      {worstStatus !== 0 && (
        <span
          className={`subscription-summary__status subscription-summary__status--${getStatusType(
            { status: worstStatus }
          )}`}
        >
          {PLAN_STATUS_TEXT[worstStatus]}
          <button
            className="subscription-summary__update-link"
            onClick={onUpgradeClicked}
          >
            Upgrade now
          </button>
        </span>
      )}
      {!worstStatus && (
        <span className="subscription-summary__main">
          <button onClick={onUpgradeClicked}>
            {capitalize(subscription.plan)}
          </button>
        </span>
      )}
    </div>
  );
};

SubscriptionSummary.propTypes = {
  subscription: PropTypes.shape({
    plan: PropTypes.string.isRequired,
    is_trial: PropTypes.bool.isRequired,
    trial_expires: PropTypes.number.isRequired,
  }).isRequired,
  onUpgradeClicked: PropTypes.func.isRequired,
};

export default SubscriptionSummary;
