import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { CSSTransitionGroup } from 'react-transition-group';

import { PieChart } from 'access-watch-ui-components';

import ChartLabels from './chart_labels';

const CircleChartContainer = ({
  loading,
  data,
  onClick,
  orderFn,
  classSuffix,
}) => (
  <CSSTransitionGroup
    component="div"
    className={cx('session-distributions', {
      'session-distributions--loading': loading,
    })}
    transitionAppear={false}
    transitionLeave={false}
    transitionEnter={false}
    transitionEnterTimeout={800}
    transitionName="fade"
  >
    {data.length && (
      <div>
        <div className="session-distributions__placeholder" />
        <CSSTransitionGroup
          component="div"
          transitionAppear
          transitionLeave={false}
          transitionEnter={false}
          transitionEnterTimeout={1200}
          transitionAppearTimeout={1200}
          transitionName="breathe"
        >
          <PieChart
            distributions={data.sort(orderFn)}
            onClick={onClick}
            className={`circle-chart--${classSuffix}`}
          />
        </CSSTransitionGroup>
        <ChartLabels distributions={data.sort(orderFn)} />
      </div>
    )}
  </CSSTransitionGroup>
);

CircleChartContainer.propTypes = {
  loading: PropTypes.bool,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      percentage: PropTypes.number.isRequired,
    })
  ).isRequired,
  onClick: PropTypes.func,
  orderFn: PropTypes.func,
  classSuffix: PropTypes.string,
};

CircleChartContainer.defaultProps = {
  loading: false,
  onClick: _ => _,
  orderFn: null,
  classSuffix: null,
};

CircleChartContainer.defaultProps = {
  orderFn: _ => _,
};

export default CircleChartContainer;
