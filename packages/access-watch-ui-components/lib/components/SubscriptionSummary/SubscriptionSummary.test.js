import React from 'react';
import ReactDOM from 'react-dom';
import SubscriptionSummary from './SubscriptionSummary';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<SubscriptionSummary subscription={{plan: 'FREE', status: []}} />, div);
});
