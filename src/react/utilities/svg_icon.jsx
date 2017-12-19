// source: https://gist.github.com/MoOx/1eb30eac43b2114de73a
/*eslint-disable*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import blacklist from 'blacklist';

import '../../../scss/svg_icon.scss';

const cleanups = {
  // some useless stuff for us
  // that svgo doesn't remove
  title: /<title>.*<\/title>/gi,
  desc: /<desc>.*<\/desc>/gi,
  comment: /<!--.*-->/gi,
  defs: /<defs>.*<\/defs>/gi,

  // remove hardcoded dimensions
  width: / +width="\d+(\.\d+)?(px)?"/gi,
  height: / +height="\d+(\.\d+)?(px)?"/gi,

  // remove fill
  fill: / +fill="(none|#[0-9a-f]+)"/gi,

  // Sketch.app shit
  sketchMSShapeGroup: / +sketch:type="MSShapeGroup"/gi,
  sketchMSPage: / +sketch:type="MSPage"/gi,
  sketchMSLayerGroup: / +sketch:type="MSLayerGroup"/gi,
};

export default class SVGIcon extends Component {
  static defaultProps = {
    component: 'span',
    classSuffix: '__svg',
    cleanup: ['title', 'desc', 'comment'],
    cleanupExceptions: [],
  };

  static propTypes = {
    component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    classSuffix: PropTypes.string,
    svg: PropTypes.string.isRequired,
    fill: PropTypes.string,
    cleanup: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
    width: PropTypes.string,
    height: PropTypes.string,
  };

  static cleanupSvg(svg, cleanup = []) {
    return Object.keys(cleanups)
      .filter(key => cleanup.includes(key))
      .reduce((acc, key) => acc.replace(cleanups[key], ''), svg)
      .trim();
  }

  render() {
    const { className, component, svg, fill } = this.props;

    let cleanup = this.props.cleanup;
    if (
      // simple way to enable entire cleanup
      cleanup === true ||
      // passing cleanupExceptions enable cleanup as well
      (this.props.cleanup.length === 0 &&
        this.props.cleanupExceptions.length > 0)
    ) {
      cleanup = Object.keys(cleanups);
    }
    cleanup = cleanup.filter(key => {
      return !this.props.cleanupExceptions.includes(key);
    });

    let { width, height } = this.props;

    if (width && height === undefined) {
      height = width;
    }

    const props = {
      ...this.props,
      svg: null,
      fill: null,
      width: null,
      height: null,
    };

    const classes = cx({
      SVGIcon: true,
      'SVGIcon--cleaned': cleanup.length,
      [className]: className,
    });
    const svgClasses =
      classes.split(' ').join(this.props.classSuffix + ' ') +
      this.props.classSuffix;

    return React.createElement(component, {
      ...blacklist(
        props,
        'svg',
        'component',
        'classSuffix',
        'cleanup',
        'cleanupExceptions'
      ), // take most props
      className: classes,
      dangerouslySetInnerHTML: {
        __html: SVGIcon.cleanupSvg(svg, cleanup).replace(
          /<svg/,
          `<svg class="${svgClasses}"` +
            (fill ? ` fill="${fill}"` : '') +
            (width || height
              ? ' style="' +
                (width ? `width: ${width};` : '') +
                (height ? `height: ${height};` : '') +
                '"'
              : '')
        ),
      },
    });
  }
}
