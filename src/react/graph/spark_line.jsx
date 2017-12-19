import React from 'react';
import PropTypes from 'prop-types';

const defaultMax = dataPoints =>
  dataPoints.reduce((max, v) => Math.max(max, v), 0);

const DEFAULT_MAX_DATA_POINT_SIZE = 2;
const DEFAULT_MIN_DATA_POINT_SIZE = DEFAULT_MAX_DATA_POINT_SIZE * 0.7;
const DATA_POINT_HOVER_SIZE = DEFAULT_MAX_DATA_POINT_SIZE * 2;
const DEFAULT_PADDING = DEFAULT_MAX_DATA_POINT_SIZE * 1.8;

const xValToSvg = (w, length, padding) => v =>
  w - padding / 2 - v / (length - 1) * (w - padding);
const yValToSvg = (height, dataPoints, max, padding) => v =>
  max === 0
    ? height - padding / 2
    : height - padding / 2 - v / max * (height - padding);

const getPath = dataPoints =>
  dataPoints.reduce((s, { x, y }) => `${s ? s + ' L' : 'M'} ${x} ${y}`, null);

const getMaskId = id => `spark-line__mask__${id}`;
const getGradientId = id => `spark-line__gradient__${id}`;

class SparkLine extends React.Component {
  state = {};

  componentDidMount() {
    const { parentElement } = this.dom;
    const style = window.getComputedStyle(parentElement);
    const padding =
      parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const width = parentElement.offsetWidth - padding;
    // TODO FIXME Setting state in componentDidMount is not great,
    // should find something better like an HOC which will give in the width
    // eslint-disable-next-line
    this.setState({ width });
  }

  handleHover = (x, y, { clientX, clientY }) => {
    this.setState({
      currentHover: { x, y, clientX, clientY },
    });
  };

  handleMouseLeave = _ => {
    this.setState({ currentHover: null });
  };

  render() {
    const { width = 0, currentHover } = this.state;
    const {
      height,
      dataPoints: origDataPoints,
      intensityGradient,
    } = this.props;
    const max = this.props.max || defaultMax(origDataPoints);
    const length = this.props.length || origDataPoints.length;
    const dataPoints = origDataPoints.map((y, x) => ({
      x: xValToSvg(width, length, DEFAULT_PADDING)(x),
      y: yValToSvg(height, dataPoints, max, DEFAULT_PADDING)(y),
    }));
    const commonPathProps = {
      d: getPath(dataPoints),
      style: {
        stroke: 'black',
        strokeWidth: 1,
        fill: 'none',
      },
    };

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        height={height}
        width={width}
        className="spark-line"
        ref={ref => {
          this.dom = ref;
        }}
        style={{
          overflow: 'visible',
          cursor: 'default',
        }}
      >
        {intensityGradient && (
          <defs>
            <mask id={getMaskId(intensityGradient.id)}>
              <path
                {...{
                  ...commonPathProps,
                  style: {
                    ...commonPathProps,
                    stroke: 'white',
                  },
                }}
              />
              {/* eslint-disable react/no-array-index-key */
              dataPoints.map(({ x, y }, i) => (
                <circle
                  cx={x}
                  cy={y}
                  r={
                    currentHover && currentHover.x === i
                      ? DEFAULT_MAX_DATA_POINT_SIZE
                      : DEFAULT_MIN_DATA_POINT_SIZE
                  }
                  fill="white"
                  key={`fillPoint-${i}`}
                />
              ))
              /* eslint-enable react/no-array-index-key */
              }
            </mask>
            <linearGradient
              id={getGradientId(intensityGradient.id)}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              {intensityGradient.stops.map(({ offset, color }) => (
                <stop key={offset} offset={offset + '%'} stopColor={color} />
              ))}
            </linearGradient>
          </defs>
        )}
        {!intensityGradient &&
          commonPathProps && (
            <path {...commonPathProps} className="spark-line__path" />
          )}
        {intensityGradient &&
          commonPathProps && (
            <rect
              x="0"
              y="0"
              width={width}
              height={height}
              fill={`url(#${getGradientId(intensityGradient.id)})`}
              mask={`url(#${getMaskId(intensityGradient.id)})`}
            />
          )}
        {/* eslint-disable react/no-array-index-key */
        dataPoints.map(({ x, y }, i) => (
          <circle
            cx={x}
            cy={y}
            key={`hoverPoint-${i}`}
            r={DATA_POINT_HOVER_SIZE}
            fill="transparent"
            onMouseEnter={e => this.handleHover(i, origDataPoints[i], e)}
            onMouseLeave={_ => this.handleMouseLeave()}
          />
        ))
        /* eslint-enable react/no-array-index-key */
        }
        {currentHover && (
          <text
            x={xValToSvg(width, length, DEFAULT_PADDING)(currentHover.x)}
            y={
              yValToSvg(height, dataPoints, max, DEFAULT_PADDING)(
                currentHover.y
              ) - 8
            }
            fill="black"
            color="black"
            fontSize="12"
            textAnchor="middle"
            style={{
              pointerEvents: 'none',
            }}
          >
            {currentHover.y}
          </text>
        )}
      </svg>
    );
  }
}

SparkLine.propTypes = {
  height: PropTypes.number.isRequired,
  dataPoints: PropTypes.arrayOf(PropTypes.number).isRequired,
  max: PropTypes.number,
  intensityGradient: PropTypes.shape({
    id: PropTypes.string.isRequired,
    stops: PropTypes.arrayOf(
      PropTypes.shape({
        offset: PropTypes.number.isRequired,
        color: PropTypes.string.isRequired,
      })
    ).isRequired,
  }),
  length: PropTypes.number,
};

SparkLine.defaultProps = {
  max: null,
  intensityGradient: null,
  length: null,
};

export default SparkLine;
