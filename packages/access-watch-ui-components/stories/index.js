import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withInfo } from '@storybook/addon-info';

import {
  ChatButton,
  SettingsButton,
  IntegrationPicker,
  IntegrationManual,
  CodeBlock,
  FlagIcon,
  Loader,
  SubscriptionSummary,
  PieChart,
} from '../lib';

import integrations from './data/integrations';
import './index.scss';

storiesOf('ChatButton', module)
.add('default', () => <ChatButton />);


const SettingsButonDesc = 'SettingsButton allows you to have an interface with settings and an avatar part';
storiesOf('SettingsButton', module)
.add('default', withInfo(
  SettingsButonDesc,
)(() => (
    <SettingsButton
      fullname="Jean Duthon"
      email="jean@access.watch"
      emailHash="2bf466e45523c7df8406d340bf231982"
      actions={{example: {text: "A log action", action: action('exampleClicked')}}}
    />
)))
.add('with an invalid email hash', withInfo(
  SettingsButonDesc,
)(() => (
  <SettingsButton
    fullname="Jean Tatooine"
    email="jean@tatooine.org"
    emailHash="invalidEmailHash"
    actions={{example: {text: "A log action", action: action('exampleClicked')}}}
  />
)))
.add('button without photo', withInfo(
  SettingsButonDesc,
)(() => (
  <SettingsButton
    fullname="Jean Duthon"
    email="jean@access.watch"
    emailHash="2bf466e45523c7df8406d340bf231982"
    actions={{example: {text: "A log action", action: action('exampleClicked')}}}
    hidePhoto
  />
)));

storiesOf('IntegrationPicker', module)
.add('default', () => (
  <IntegrationPicker
    integrations={integrations}
    onChange={action('Integration picked')}
  />
));

storiesOf('IntegrationManual', module)
.add('default', () => (
  <IntegrationManual
    site={{API_KEY: 'fake_api_key', url: 'http://fake_site.com'}}
    integration={integrations.filter(({id}) => id === 'php')[0]}
    integrations={integrations}
    handleNewParams={action('Integration clicked')}
  />
));

storiesOf('CodeBlock', module)
.add('default', () => (
  <CodeBlock language="javascript">
{`function helloWorld() {
  console.log('Hello world');
}
helloWorld();
`}
  </CodeBlock>
));

storiesOf('FlagIcon', module)
.add('default', () => <FlagIcon cc="DE" title="Germany" />)
.add('medium size', () => <FlagIcon cc="SE" title="Sweden" size="m" />)
.add('big size', () => <FlagIcon cc="US" title="USA" size="l" />);


storiesOf('Loader', module)
.add('default', withInfo(
  'Shows a loading state',
)(() => (
    <Loader />
)))
.add('with color overwritten', withInfo(
  'Shows a loading state',
)(() => (
    <Loader color="pink" />
)));

storiesOf('SubscriptionSummary', module)
.add('default', withInfo(
  'Shows a summary of your subscription',
)(() => (
    <SubscriptionSummary subscription={{plan: 'FREE', status: []}} onUpgradeClicked={action} />
)))
.add('with a bad status', withInfo(
  'Shows a summary of your subscription',
)(() => (
    <SubscriptionSummary subscription={{plan: 'FREE', status: ['requests_exceeded']}} onUpgradeClicked={action} />
)));

const fakeDistributions = [{
  name: 'foo',
  percentage: 0.55
}, {
  name: 'bar',
  percentage: 0.25
}, {
  name: 'baz',
  percentage: 0.2
}];

const fakeDistributionsEmpty = fakeDistributions.map(d => ({
  ...d,
  percentage: 0
}));

const trickyDistributions = [{
  name: 'foo',
  //percentage: 0.71223
  percentage: 0.3
}, {
  name: 'bar',
  //percentage: 0.28777
  percentage: 0.7
}];

const oneDistribution = [{
  name: 'foo',
  percentage: 1
}];

storiesOf('PieChart', module)
.add('default', withInfo(
  'Shows a Pie Chart',
)(() => (
    <PieChart distributions={fakeDistributions} />
)))
.add('with only two values', withInfo(
  'Shows a Pie Chart',
)(() => (
    <PieChart distributions={trickyDistributions} />
)))
.add('with only one value', withInfo(
  'Shows a Pie Chart',
)(() => (
    <PieChart distributions={oneDistribution} />
)))
.add('with empty values', withInfo(
  'Shows a Pie Chart',
)(() => (
    <PieChart distributions={fakeDistributionsEmpty} />
)))
.add('animated', withInfo(
  'Shows a Pie Chart',
)(() => (
    <PieChart distributions={fakeDistributions} animate />
)));
