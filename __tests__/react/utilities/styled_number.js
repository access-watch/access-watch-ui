import React from 'react';
import { shallow } from 'enzyme';

import StyledNumber from '../../../src/react/utilities/styled_number';

describe('StyledNumber', () => {
  it('renders a styled number', () => {
    const wrapper = shallow(<StyledNumber value={10.53} />);
    expect(wrapper.find('.styled-number__integer').text()).toEqual('10');
    expect(wrapper.find('.styled-number__fraction').text()).toEqual('53');
  });

  it('renders a styled number with exactly 2 digits fraction by default', () => {
    let wrapper = shallow(<StyledNumber value={10.5} />);
    expect(wrapper.find('.styled-number__integer').text()).toEqual('10');
    expect(wrapper.find('.styled-number__fraction').text()).toEqual('50');
    wrapper = shallow(<StyledNumber value={1.533} />);
    expect(wrapper.find('.styled-number__integer').text()).toEqual('1');
    expect(wrapper.find('.styled-number__fraction').text()).toEqual('53');
  });

  it('can be themed', () => {
    const wrapper = shallow(<StyledNumber value={10.5} theme="test" />);
    expect(wrapper.find('.styled-number.styled-number--test').length).toEqual(
      1
    );
  });
});
