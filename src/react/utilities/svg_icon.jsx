// source: https://gist.github.com/MoOx/1eb30eac43b2114de73a
/*eslint-disable*/
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import blacklist from 'blacklist';

import '../../../scss/svg_icon.scss';

export default class SVGIcon extends React.PureComponent {
  static defaultProps = {
    component: 'span',
    classSuffix: '__svg',
  };

  static propTypes = {
    component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    classSuffix: PropTypes.string,
    svg: PropTypes.string.isRequired,
  };

  render() {
    const { className, component, svg } = this.props;

    let { width, height } = this.props;

    if (width && height === undefined) {
      height = width;
    }

    const classes = cx({
      SVGIcon: true,
      [className]: className,
    });
    const svgClasses =
      classes.split(' ').join(this.props.classSuffix + ' ') +
      this.props.classSuffix;

    return React.createElement(component, {
      ...blacklist(this.props, 'svg', 'component', 'classSuffix'), // take most props
      className: classes,
      dangerouslySetInnerHTML: {
        __html: svg.replace('<svg', `<svg class="${svgClasses}"`),
      },
    });
  }
}
