import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import omit from 'blacklist';

import { ObjectPropertiesEqual } from '../../utilities/object';
import {
  mouseMoveWhenClicked$,
  mapWindowXYToElementXY,
} from '../../utilities/interaction';

const getLeftBoundary = ({ x, x1 }) => Math.min(x, x1);
const getRightBoundary = ({ x, x1 }) => Math.max(x, x1);
const leftBoundaryKey = p =>
  Object.keys(p).reduce((acc, k) => (p[k] > p[acc] ? acc : k));
const rightBoundaryKey = p =>
  Object.keys(p).reduce((acc, k) => (p[k] < p[acc] ? acc : k));

const HANDLER_SIZE = 16;

const handlerArrow = (arrowSize, right) => (
  <path
    d={`M ${arrowSize * (0.25 * (right ? 2.25 : 1))} ${arrowSize * 0.6}
    v ${arrowSize * 0.8}
    l ${arrowSize * 0.5 * (right ? 1 : -1)} ${-arrowSize * 0.4} z`}
    fill="rgba(0, 0, 0, 0.7)"
  />
);

const HandlerCircle = ({ size, ...config }) => (
  <circle {...config} r={size / 2} cx={size / 4} cy={size / 2} />
);

HandlerCircle.propTypes = {
  size: PropTypes.number.isRequired,
};

const Handler = ({ x, y, fill }) => (
  <g transform={`translate(${x}, ${y})`}>
    {HandlerCircle({ size: HANDLER_SIZE, fill })}
    {handlerArrow(HANDLER_SIZE / 2)}
    {handlerArrow(HANDLER_SIZE / 2, true)}
  </g>
);

Handler.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  fill: PropTypes.string,
};

Handler.defaultProps = {
  fill: 'rgba(255, 255, 255, 0.8)',
};

export default class Range extends React.Component {
  static propTypes = {
    range: PropTypes.shape({
      x: PropTypes.number,
      x1: PropTypes.number,
    }).isRequired,
    height: PropTypes.number.isRequired,
    onHandlerChanged: PropTypes.func,
    // parent should be an HTML element, but no PropTypes for this...
    // eslint-disable-next-line react/forbid-prop-types
    parent: PropTypes.object.isRequired,
  };

  static defaultProps = {
    onHandlerChanged: null,
  };

  constructor(props) {
    super(props);
    const { onHandlerChanged, range } = props;
    if (onHandlerChanged && range) {
      this.state = {
        ...this.state,
        handlersPos: range,
      };
    }
  }

  state = {};

  componentDidMount() {
    const { onHandlerChanged } = this.props;
    if (onHandlerChanged) {
      const { handlers } = this;
      Object.keys(handlers).forEach(k => {
        this.subscribeHandlerMove(k);
      });
    }
  }

  componentWillReceiveProps({ range, onHandlerChanged }) {
    const withHandlers = onHandlerChanged;
    const { rangeModificationInProcess } = this.state;
    const rangeDiff = ObjectPropertiesEqual(range, this.props.range);
    if (withHandlers && rangeDiff && !rangeModificationInProcess) {
      this.setState({
        handlersPos: range,
        rangeModificationInProcess: false,
      });
    }
  }

  componentWillUnmount() {
    this.handlersSubscription.forEach(s => s.unsubscribe());
  }

  handlers = {};
  handlersPos = {};
  handlersSubscription = [];

  subscribeHandlerMove(k) {
    const { handlers } = this;
    this.handlersSubscription.push(
      mouseMoveWhenClicked$({
        element: handlers[k],
        stopPropagation: true,
        moveOnWindow: true,
      }).subscribe(
        this.handleHandlerChange.bind(this, k),
        _ => _,
        this.handleHandlerChanged.bind(this, k)
      )
    );
  }

  handleHandlerChange(k, { x }) {
    const { handlersPos } = this.state;
    const { parent } = this.props;
    const pos = mapWindowXYToElementXY({ element: parent, x }).x;
    this.setState({
      handlersPos: {
        ...handlersPos,
        [k]: pos,
      },
      rangeModificationInProcess: true,
    });
  }

  handleHandlerChanged(k) {
    const { onHandlerChanged } = this.props;
    const { handlersPos } = this.state;
    onHandlerChanged({
      id: k,
      pos: handlersPos[k],
    });
    this.setState({
      rangeModificationInProcess: false,
    });
    this.subscribeHandlerMove(k);
  }

  render() {
    const { range, height, onHandlerChanged } = this.props;
    const { handlersPos } = this.state;
    const withHandlers = !!onHandlerChanged;
    const leftBoundary = getLeftBoundary(handlersPos || range);
    const rightBoundary = getRightBoundary(handlersPos || range);
    const commonRectProps = {
      y: 0,
      height,
      fill: 'url(#smooth-curve__range-gradient)',
    };
    const commonBarProps = {
      ...commonRectProps,
      width: 3,
    };
    const rangeProps = {
      ...commonRectProps,
      x: leftBoundary + commonBarProps.width,
      width: rightBoundary - leftBoundary - commonBarProps.width,
      className: cx('smooth-curve__range', {
        'smooth-curve__range__active': !!range,
      }),
      style: { opacity: 0.5 },
    };
    const handlerPadding = 2;
    const handlerExtrude = HANDLER_SIZE * 1.2;
    const handlerExtrusion = handlerExtrude - HANDLER_SIZE;
    let svgHandlersPos;
    let boundaries;
    if (withHandlers) {
      svgHandlersPos = [
        {
          x: leftBoundary - HANDLER_SIZE / 4,
          y: height - handlerPadding - HANDLER_SIZE,
          key: leftBoundaryKey(handlersPos),
        },
        {
          x: rightBoundary - HANDLER_SIZE / 2,
          y: handlerPadding,
          key: rightBoundaryKey(handlersPos),
        },
      ];
      boundaries = svgHandlersPos.map(p => <Handler {...p} />);
    } else {
      boundaries = [
        <rect x={leftBoundary} {...commonBarProps} key="right-boundary" />,
        <rect x={rightBoundary} {...commonBarProps} key="left-boundary" />,
      ];
    }
    return (
      <g>
        <defs>
          <linearGradient
            id="smooth-curve__range-gradient"
            x1="0"
            x2="0"
            y1="1"
            y2="0"
          >
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.7)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>
        </defs>
        {withHandlers && (
          <g>
            <path
              {...omit(rangeProps, 'height', 'y', 'width', 'x')}
              d={`M ${leftBoundary} ${rangeProps.y}
              v ${rangeProps.height -
                HANDLER_SIZE -
                handlerPadding -
                handlerExtrusion / 2}
              a ${handlerExtrude / 2} ${handlerExtrude /
                2}, 0, 1, 1, 0 ${handlerExtrude}
              v ${handlerPadding + handlerExtrusion / 2}
              h ${rangeProps.width}
              v ${-(rangeProps.height - HANDLER_SIZE - handlerExtrusion / 2)}
              a ${-handlerExtrude / 2} ${-handlerExtrude /
                2}, 0, 1, 1, 0 ${-handlerExtrude}
              v ${-handlerExtrusion / 2}
              z
              `}
            />
            {boundaries.map((b, i) => (
              <g
                key={`handler-${svgHandlersPos[i].key}`}
                ref={g => {
                  this.handlers[svgHandlersPos[i].key] = g;
                }}
              >
                {b}
              </g>
            ))}
          </g>
        )}
        {!withHandlers && (
          <g>
            <rect {...rangeProps} />
            {boundaries}
          </g>
        )}
      </g>
    );
  }
}
