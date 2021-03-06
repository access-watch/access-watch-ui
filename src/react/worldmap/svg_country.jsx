import React from 'react';
import PropTypes from 'prop-types';

export default class Country extends React.Component {
  static propTypes = {
    cc: PropTypes.string.isRequired,
    onUnfocus: PropTypes.func.isRequired,
    onFocus: PropTypes.func.isRequired,
    polygons: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    hover: PropTypes.bool.isRequired,
    fill: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  handleMouseOut = _ => {
    this.props.onUnfocus(this.props.cc);
  };

  handleMouseOver = _ => {
    this.props.onFocus(this.props.cc);
  };

  handleClick = _ => {
    const { onClick, cc } = this.props;
    onClick(cc);
    this.handleMouseOver();
  };

  render() {
    const { fill, cc, polygons, hover } = this.props;

    return (
      <g
        onMouseOver={this.handleMouseOver}
        onFocus={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
        onBlur={this.handleMouseOut}
        id={cc}
        onClick={this.handleClick}
      >
        {polygons.map(poly => (
          <polygon
            key={poly.join(',')}
            points={poly.join(',')}
            style={{
              opacity: 1,
              stroke: hover ? '#000000' : 'none',
              fill,
              transition: 'stroke .2s',
              cursor: 'pointer',
            }}
          />
        ))}
      </g>
    );
  }
}
