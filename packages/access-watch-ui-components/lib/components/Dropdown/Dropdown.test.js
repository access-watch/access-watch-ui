import React from 'react';
import { mount } from 'enzyme';

import Dropdown from './Dropdown';

describe('Dropdown', () => {
  const countryValues = {
    de: 'Germany',
    fr: 'France',
    us: 'United States of America',
  };

  it('displays a dropdown which can be opened', () => {
    const dropdown = mount(<Dropdown values={countryValues} />);
    const button = dropdown.find('button').first();
    button.simulate('click');
    const list = dropdown.find('ul').first();
    expect(list.children().length).toEqual(3);
  });

  it('can have control of the opened state through props', () => {
    const onDropdownStateChangeMock = jest.fn();
    const dropdown = mount(
      <Dropdown
        values={countryValues}
        onDropdownStateChange={onDropdownStateChangeMock}
        open={true}
      />
    );
    const list = dropdown.find('ul').first();
    expect(list.children().length).toEqual(3);
    const button = dropdown.find('button').first();
    button.simulate('click');
    expect(onDropdownStateChangeMock.mock.calls.length).toEqual(1);
  });

  it('notifies of changes', () => {
    const onChangeMock = jest.fn();
    const dropdown = mount(
      <Dropdown
        values={countryValues}
        open={true}
        onChange={onChangeMock}
      />
    );
    const firstItemButton = dropdown.find('ul').first().find('button').first();
    firstItemButton.simulate('click');
    expect(onChangeMock.mock.calls.length).toEqual(1);
    expect(onChangeMock.mock.calls[0][0]).toEqual(Object.keys(countryValues)[0]);
  });

  it('has correct class when dropdown opened', () => {
    const dropdown = mount(
      <Dropdown
        values={countryValues}
      />
    );
    dropdown.find('button').first().simulate('click');
    expect(dropdown.childAt(0).hasClass('dropdown--open')).toEqual(true);
  });

  it('can render custom children', () => {
    const onClickMock = jest.fn();
    const dropdown = mount(
      <Dropdown open={true}>
        <div key="de">
          Germany
        </div>
        <div key="fr" id="toBeClicked" onClick={_ => onClickMock('good')}>
          France
        </div>
        <div key="us">
          United States of America
        </div>
      </Dropdown>
    );
    dropdown.find('#toBeClicked').simulate('click');
    expect(onClickMock.mock.calls.length).toEqual(1);
    expect(onClickMock.mock.calls[0][0]).toEqual('good');
  });
});
