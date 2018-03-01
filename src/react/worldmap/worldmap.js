import React from 'react';
import PropTypes from 'prop-types';
import { countries } from 'access-watch-ui-components';

import { formatPercentage } from '../../i18n';
import { calculateColorGradient } from '../../utilities/color';
import LoadingIcon from '../utilities/loading_icon';
import { V_SHOW_TOOLTIP, V_SET_TOOLTIP } from '../../event_hub';

import Country from './svg_country';
import map from './country_shapes.json';
import GradientLegend from './gradient_legend';

import '../../../scss/worldmap.scss';

const percentMax = 20;
const colorMin = '#f5f5f5';
const gradientFactor = 0.5;

const getFill = (cc, metrics, color) => {
  if (!metrics || !metrics.percentage) {
    return colorMin;
  }
  return calculateColorGradient(
    gradientFactor,
    colorMin,
    color,
    metrics.percentage / 100,
    percentMax / 100
  );
};

export const metricsPropTypes = PropTypes.objectOf(
  PropTypes.shape({
    count: PropTypes.number.isRequired,
    percentage: PropTypes.number.isRequired,
  })
);

export default class WorldmapMain extends React.Component {
  static propTypes = {
    activeCountry: PropTypes.shape({
      alpha2: PropTypes.string,
    }),
    metrics: PropTypes.objectOf(PropTypes.object).isRequired,
    dispatch: PropTypes.func.isRequired,
    color: PropTypes.string.isRequired,
    loading: PropTypes.bool,
    showLegend: PropTypes.bool,
    onCountryClick: PropTypes.func.isRequired,
  };

  static defaultProps = {
    activeCountry: null,
    loading: false,
    showLegend: true,
  };

  handleMouseOver = cc => {
    const CC = cc.toUpperCase();
    const metrics = this.props.metrics[CC];
    const country = countries[CC];
    const message = (
      <div>
        {country.name}
        <br />
        {formatPercentage((metrics && metrics.percentage) || 0) + '%'}
      </div>
    );
    this.props.dispatch({ type: V_SET_TOOLTIP, message });
    this.props.dispatch({ type: V_SHOW_TOOLTIP, visible: true });
  };

  handleMouseOut = () => {
    this.props.dispatch({ type: V_SHOW_TOOLTIP, visible: false });
  };

  handleCountryClick = cc => {
    this.props.onCountryClick(cc);
  };

  render() {
    const { activeCountry, metrics, color, loading, showLegend } = this.props;

    return (
      <div className="worldmap">
        <div className="worldmap__countries">
          <svg
            height="100%"
            width="100%"
            style={{ position: 'relative' }}
            viewBox="0 0 1000 500"
            className="worldmap__map"
          >
            {Object.keys(map).map(cc => (
              <Country
                polygons={map[cc]}
                hover={
                  !!(
                    !loading &&
                    activeCountry &&
                    activeCountry.alpha2 === cc.toUpperCase()
                  )
                }
                key={cc}
                cc={cc}
                onFocus={this.handleMouseOver}
                onUnfocus={this.handleMouseOut}
                fill={
                  loading
                    ? colorMin
                    : getFill(cc, metrics[cc.toUpperCase()], color)
                }
                onClick={this.handleCountryClick}
              />
            ))}
          </svg>
          {loading && (
            <div className="worldmap__loader-container">
              <LoadingIcon message="loading data..." />
            </div>
          )}
        </div>
        {showLegend && (
          <div className="legend">
            <span className="legend__label">{`> ${percentMax} %`}</span>
            <span className="legend__gradient">
              <GradientLegend
                colorMin={colorMin}
                colorMax={color}
                gradientFactor={gradientFactor}
                reverse
                className="legend__gradient"
              />
            </span>
            <span className="legend__label">0</span>
          </div>
        )}
      </div>
    );
  }
}
