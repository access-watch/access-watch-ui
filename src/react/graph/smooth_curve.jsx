import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CSSTransitionGroup } from 'react-transition-group';
import cx from 'classnames';

import { Loader } from 'access-watch-ui-components';

import {
  rangeSelector$,
  mapWindowXYToElementXY,
} from '../../utilities/interaction';
import { ObjectPropertiesEqual } from '../../utilities/object';
import Range from './range';
import { activityDataPropType } from '../prop_types';

import '../../../scss/smooth_curve.scss';

/* Black magic from here https://www.particleincell.com/2012/bezier-splines/ */
const computeControlPoints = K => {
  const p1 = [];
  const p2 = [];
  const a = [];
  const b = [];
  const c = [];
  const r = [];
  const n = K.length - 1;
  let i;
  let m;

  /* left most segment */
  a.push(0);
  b.push(2);
  c.push(1);
  r.push(K[0] + 2 * K[1]);

  /* internal segments */
  for (i = 1; i < n - 1; i++) {
    a[i] = 1;
    b[i] = 4;
    c[i] = 1;
    r[i] = 4 * K[i] + 2 * K[i + 1];
  }

  /* right segment */
  a[n - 1] = 2;
  b[n - 1] = 7;
  c[n - 1] = 0;
  r[n - 1] = 8 * K[n - 1] + K[n];

  /* solves Ax=b with the Thomas algorithm (from Wikipedia) */
  for (i = 1; i < n; i++) {
    m = a[i] / b[i - 1];
    b[i] -= m * c[i - 1];
    r[i] -= m * r[i - 1];
  }

  p1[n - 1] = r[n - 1] / b[n - 1];
  for (i = n - 2; i >= 0; --i) {
    p1[i] = (r[i] - c[i] * p1[i + 1]) / b[i];
  }

  /* we have p1, now compute p2 */
  for (i = 0; i < n - 1; i++) {
    p2[i] = 2 * K[i + 1] - p1[i + 1];
  }

  p2[n - 1] = 0.5 * (K[n] + p1[n - 1]);

  return { p1, p2 };
};

const computeAllCP = data => ({
  x: computeControlPoints(data.map(i => i[0])),
  y: computeControlPoints(data.map(i => i[1])),
});

const getMaxVal = dataDict => {
  const dataSeries = Object.keys(dataDict);
  return dataDict[dataSeries[0]].reduce(
    (max, current, i) =>
      Math.max(
        max,
        dataSeries.reduce((val, dataKey) => val + dataDict[dataKey][i][1], 0)
      ),
    0
  );
};

const createLogMeanSmoother = mean => v =>
  v === 0 ? 0 : Math.log((mean + v) / mean);

const cSfx = (classn, suffixes) =>
  [classn, ...suffixes.map(s => `${classn}--${s}`)].join(' ');

const computeCPS = preparedData =>
  Object.keys(preparedData).reduce(
    (acc, key) => ({
      ...acc,
      [key]: computeAllCP(preparedData[key]),
    }),
    {}
  );

const TRANSITION_TIME = 500;

export default class SmoothCurve extends Component {
  static propTypes = {
    onHover: PropTypes.func,
    onCurveClicked: PropTypes.func,
    data: activityDataPropType.isRequired,
    renderTooltip: PropTypes.func,
    classSuffix: PropTypes.string,
    onRangeChanged: PropTypes.func,
    selectedRange: PropTypes.shape({
      x: PropTypes.number,
      x1: PropTypes.number,
    }),
    height: PropTypes.number,
    withTooltip: PropTypes.bool,
    withHandlers: PropTypes.bool,
    loading: PropTypes.bool,
    // Disabled here as we are using this props in an inner function
    // so eslint does not understand it
    // eslint-disable-next-line react/no-unused-prop-types
    max: PropTypes.number,
    selectable: PropTypes.bool,
    animated: PropTypes.bool,
  };

  static defaultProps = {
    renderTooltip: null,
    selectedRange: null,
    height: null,
    withTooltip: false,
    withHandlers: true,
    loading: false,
    onHover: _ => {},
    onCurveClicked: _ => {},
    classSuffix: '',
    onRangeChanged: _ => {},
    max: null,
    selectable: true,
    animated: true,
  };

  constructor(props, defaultProps) {
    super(props, defaultProps);

    this.domCurves = {};
    this.CPS = null;
    this.limitY = props.height;
    this.state = { activeCurve: null, rangeSelectionInProgress: false };
  }

  componentDidMount() {
    const { selectable } = this.props;
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ limitX: this.mainEl.parentElement.offsetWidth });
    if (!this.limitY) {
      this.limitY = this.mainEl.parentElement.offsetHeight;
    }
    window.addEventListener('resize', this.handleResize);
    if (selectable) {
      this.subscribeToRangeSelector();
    }
  }

  componentWillReceiveProps({ data, selectedRange }) {
    const { rangeSelectionInProgress } = this.state;
    const prevSelectedRange = this.props.selectedRange;
    const limitsInit = this.limitY && this.state.limitX;
    const selectedRangeInit = !!this.state.range;
    const dataReady = data && data[Object.keys(data)[0]].length > 0;
    const rangeEquality = ObjectPropertiesEqual(
      prevSelectedRange,
      selectedRange
    );
    if (
      !rangeSelectionInProgress &&
      selectedRange &&
      (!rangeEquality || !selectedRangeInit) &&
      limitsInit &&
      dataReady
    ) {
      this.computeRangeState({ data, selectedRange });
    } else if (!selectedRange && !rangeSelectionInProgress) {
      this.setState({
        range: false,
      });
    }
  }

  componentWillUpdate(props, state) {
    this.eventuallyUpdatePath(props, state);
  }

  componentWillUnmount() {
    const { selectable } = this.props;
    window.removeEventListener('resize', this.handleResize);
    if (selectable) {
      this.rangeSelector.unsubscribe();
    }
  }

  onHandlerChanged = ({ id, pos }) => {
    const { range } = this.state;
    this.setState(
      {
        range: { ...range, [id]: pos },
      },
      this.handleRangeChanged
    );
  };

  getYFromBCurve = (x, dataSerie, CPS) => {
    const dataX = this.convertSvgToValX(x, dataSerie.length);
    const x1 = Math.floor(dataX);
    const t = dataX - x1;
    const svgY1 = dataSerie[x1][1];
    const svgY2 = dataSerie[x1 + 1][1];
    return (
      (1 - t) ** 3 * svgY1 +
      3 * (1 - t) ** 2 * t * CPS.y.p1[x1] +
      3 * (1 - t) * t ** 2 * CPS.y.p2[x1] +
      t ** 3 * svgY2
    );
  };

  computeRangeState = ({ selectedRange, data }) => {
    if (selectedRange) {
      this.setState({
        range: Object.keys(selectedRange).reduce(
          (acc, k) => ({
            ...acc,
            [k]: this.convertDateToSvg(selectedRange[k], data),
          }),
          {}
        ),
      });
    }
  };

  subscribeToRangeSelector = () => {
    this.rangeSelector = rangeSelector$({
      element: this.svgElement,
      sensibility: 10,
    }).subscribe(this.handleRangeChange, _ => _, this.handleRangeChanged);
  };

  handleRangeChange = ({ origPos, curPos }) => {
    const { x } = mapWindowXYToElementXY({
      element: this.svgElement,
      x: origPos.x,
    });
    const x1 = mapWindowXYToElementXY({ element: this.svgElement, x: curPos.x })
      .x;
    this.setState({
      range: { x, x1 },
      rangeSelectionInProgress: true,
    });
  };

  handleRangeChanged = _ => {
    const { range } = this.state;
    const rangeChanged = {
      x: this.convertSvgToDate(Math.min(...Object.values(range))),
      x1: this.convertSvgToDate(Math.max(...Object.values(range))),
    };
    this.setState(
      {
        rangeSelectionInProgress: false,
      },
      () => {
        this.props.onRangeChanged(rangeChanged);
        this.subscribeToRangeSelector();
      }
    );
  };

  convertSvgToDate = x => {
    const { data } = this.props;
    const firstDataSerie = data[Object.keys(data)[0]];
    const dateValues = firstDataSerie.map(v => v[0]);
    const dLength = firstDataSerie.length;
    const dStart = new Date(dateValues[0]).getTime();
    const dEnd = new Date(dateValues[dateValues.length - 1]).getTime();
    return (
      dStart +
      Math.floor(this.convertSvgToValX(x, dLength) * (dEnd - dStart) / dLength)
    );
  };

  convertDateToSvg = (xDate, d) => {
    const data = d || this.props.data;
    const firstDataSerie = data[Object.keys(data)[0]];
    const dateValues = firstDataSerie.map(v => v[0]);
    const dLength = firstDataSerie.length;
    const dStart = new Date(dateValues[0]).getTime();
    const dEnd = new Date(dateValues[dateValues.length - 1]).getTime();
    const xIndex = (xDate - dStart) * dLength / (dEnd - dStart);
    return Math.floor(this.convertToValX(xIndex, this.state.limitX, dLength));
  };

  eventuallyUpdatePath = ({ data, max, animated }, { limitX }) => {
    if (!this.state.limitX || !this.limitY) {
      return;
    }
    const existingPreparedData = !!this.preparedData;
    const newDataSeriesName = Object.keys(data);
    let shouldUpdate = false;
    if (existingPreparedData) {
      const dataSeriesName = Object.keys(this.preparedData);
      const sameDataSeries = dataSeriesName.reduce(
        (acc, i) => newDataSeriesName.indexOf(i) !== -1 && acc,
        true
      );
      shouldUpdate = !sameDataSeries;
      if (!shouldUpdate) {
        const firstDataSerie = this.props.data[dataSeriesName[0]];
        const compareDataPoints = ([x, y], [x1, y1]) => x === x1 && y === y1;
        const compareDataSeries = (ds1, ds2) =>
          ds1.reduce((acc, v, i) => acc && compareDataPoints(v, ds2[i]), true);
        const newFirstDataSerie = data[dataSeriesName[0]];
        shouldUpdate = firstDataSerie.length !== newFirstDataSerie.length;
        if (!shouldUpdate) {
          shouldUpdate =
            !(
              firstDataSerie.length !== 0 &&
              compareDataSeries(firstDataSerie, newFirstDataSerie)
            ) && firstDataSerie.length > 0;
        }
      }
    }
    if (!existingPreparedData || shouldUpdate || limitX !== this.state.limitX) {
      const aggregatedValues = data[
        newDataSeriesName[newDataSeriesName.length - 1]
      ]
        .map((_, i) =>
          newDataSeriesName.reduce((acc, dsn) => acc + data[dsn][i][1], 0)
        )
        .filter(a => a > 0)
        .sort();

      const aggregatedMean = Math.max(
        aggregatedValues[Math.round(aggregatedValues.length / 2)],
        1
      );

      const logMeanSmoother = createLogMeanSmoother(aggregatedMean);

      const smoothedData = newDataSeriesName
        .map(dataSerieName => ({
          dataSerie: data[dataSerieName],
          newYValues: data[dataSerieName].map(i => i[1]).map(logMeanSmoother),
          dataSerieName,
        }))
        .reduce(
          (acc, { dataSerie, newYValues, dataSerieName }) => ({
            ...acc,
            [dataSerieName]: dataSerie.map(([x], i) => [x, newYValues[i]]),
          }),
          {}
        );

      this.maxVal = logMeanSmoother(max) || getMaxVal(smoothedData);
      const prepareData = dataDict => {
        const dataSeries = Object.keys(dataDict);
        return dataSeries.reverse().reduce(
          (acc, dataKey, dkIndex) => ({
            ...acc,
            [dataKey]: dataDict[dataKey].map(([_, y], i) => [
              this.convertToValX(
                i,
                limitX || this.state.limitX,
                dataDict[dataKey].length
              ),
              this.convertToValY(y) -
                (dkIndex === 0
                  ? 0
                  : this.limitY - acc[dataSeries[dkIndex - 1]][i][1]),
            ]),
          }),
          {}
        );
      };

      const newPreparedData = prepareData(smoothedData);
      if (
        this.preparedData &&
        this.preparedData[Object.keys(this.preparedData)[0]].length &&
        animated
      ) {
        this.startTransition({ ...this.preparedData }, newPreparedData);
      } else {
        this.createPath(newPreparedData, computeCPS(newPreparedData));
      }
      this.preparedData = newPreparedData;
      this.CPS = computeCPS(this.preparedData);
    }
  };

  handleResize = _ => {
    this.setState(
      {
        limitX: this.mainEl.parentElement.offsetWidth,
      },
      () => {
        this.computeRangeState(this.props);
      }
    );
  };

  convertToValY = y =>
    Math.max(0, this.limitY - y * this.limitY / this.maxVal * 0.9);

  convertToValX = (x, limitX, dLength) => x * limitX / (dLength - 1);

  convertSvgToValY = y =>
    Math.round((this.limitY - y) * this.maxVal / this.limitY * 1.1);
  convertSvgToValX = (x, dLength) => x * (dLength - 1) / this.state.limitX;

  handleMouseLeave = _ => {
    const { tooltipInfos } = this.state;
    if (tooltipInfos) {
      this.setState({ tooltipInfos: null });
    }
  };

  handleMouseMove({ clientX }) {
    const { data, onHover, withTooltip } = this.props;
    if (!withTooltip) {
      return;
    }
    const { left } = this.mainEl.getBoundingClientRect();
    const dataKeys = Object.keys(data);
    const dLength = this.preparedData[dataKeys[0]].length;

    const dataX = this.convertSvgToValX(clientX - left, dLength);
    const realValues = data[dataKeys[0]][Math.round(dataX)];
    if (realValues) {
      const xValue = realValues[0];
      // const yValue = realValues[1];
      const yValues = dataKeys.reduce(
        (acc, key) => ({
          ...acc,
          [key]: data[key][Math.round(dataX)][1],
        }),
        {}
      );

      const tooltipInfos = {
        x: this.convertToValX(Math.round(dataX), this.state.limitX, dLength),
        xValue,
        yValues,
      };
      this.setState({ tooltipInfos });
      onHover(tooltipInfos);
    }
  }

  determineTooltipPos(x) {
    let position = 'center';
    const { left, width } = this.mainEl.getBoundingClientRect();
    if (this.tooltip) {
      const { width: tooltipWidth } = this.tooltip.getBoundingClientRect();
      if (x - tooltipWidth < left) {
        position = 'left';
      } else if (tooltipWidth + x > width) {
        position = 'right';
      }
    }
    return position;
  }

  startTransition(oldData, newData) {
    this.setState(
      {
        transitionStart: performance.now(),
        transitionData: { oldData, newData },
      },
      _ => requestAnimationFrame(this.dataTransition)
    );
  }

  dataTransition = timestamp => {
    const { transitionData, transitionStart } = this.state;
    const { oldData, newData } = transitionData;
    const progress = (timestamp - transitionStart) / TRANSITION_TIME;
    const progressFn = (a, b) => {
      const p = a * (1 - progress) + b * progress;
      return a > b ? Math.max(p, b) : Math.min(p, b);
    };
    let data = newData;
    let dataTransition = false;
    if (progress < 1) {
      data = Object.keys(newData)
        .map(statusKey => ({
          statusKey,
          curOldData: oldData[statusKey],
          curNewData: newData[statusKey],
        }))
        .reduce(
          (acc, { statusKey, curOldData, curNewData }) => ({
            ...acc,
            [statusKey]: curNewData.map((dataPoints, i) =>
              dataPoints.reduce(
                (ret, dataPt, j) => [
                  ...ret,
                  progressFn(
                    curOldData[
                      Math.floor(i * curOldData.length / curNewData.length)
                    ][j],
                    dataPt
                  ),
                ],
                []
              )
            ),
          }),
          {}
        );
      // eslint-disable-next-line
      dataTransition = this.dataTransition;
    }
    this.createPath(data, computeCPS(data), dataTransition);
  };

  createPath(preparedData, CPS_, dataTransition) {
    if (preparedData) {
      const path = Object.keys(preparedData)
        .reverse()
        .map(statusKey => ({
          statusKey,
          curData: preparedData[statusKey],
          CPS: CPS_[statusKey],
        }))
        .reduce(
          (acc, { statusKey, curData, CPS }) => ({
            ...acc,
            [statusKey]: curData.length && (
              <path
                ref={p => {
                  this.domCurves[statusKey] = p;
                }}
                d={curData
                  .reduce(
                    (svg, dataPoints, i) =>
                      svg.concat(
                        i === curData.length - 1
                          ? dataPoints.join(' ')
                          : `${dataPoints.join(' ')}${i !== 0 ? ' ' : ''} C ${
                              CPS.x.p1[i]
                            } ${CPS.y.p1[i]} ${CPS.x.p2[i]} ${CPS.y.p2[i]} `
                      ),
                    'M '
                  )
                  .concat(` V ${this.limitY} H 0 Z`)}
                onClick={_ => this.props.onCurveClicked(this.state.activeCurve)}
              />
            ),
          }),
          {}
        );
      this.setState({ path }, () => {
        if (dataTransition) {
          window.requestAnimationFrame(dataTransition);
        }
      });
    }
  }

  render() {
    const { limitY } = this;
    const { tooltipInfos, path, range, limitX } = this.state;
    const limitsInit = limitY && limitX;
    const {
      classSuffix,
      withHandlers,
      withTooltip,
      loading,
      renderTooltip,
      animated,
    } = this.props;

    return (
      <div
        className={cSfx('smooth-curve', [classSuffix])}
        ref={m => {
          this.mainEl = m;
        }}
      >
        <svg
          height={limitY ? `${limitY}px` : 0}
          className={cSfx('smooth-curve__svg', [classSuffix])}
          viewBox={limitsInit ? `0 0 ${limitX} ${limitY}` : '0 0 0 0'}
          preserveAspectRatio="xMinYMax slice"
          ref={svg => {
            this.svgElement = svg;
          }}
          onMouseMove={e => this.handleMouseMove(e)}
          onMouseLeave={this.handleMouseLeave}
        >
          {path &&
            Object.keys(path).map(statusKey => (
              <g
                key={statusKey}
                className={cx(
                  cSfx('smooth-curve__curve', [classSuffix, statusKey]),
                  { 'smooth-curve__curve--animated': animated }
                )}
              >
                {path[statusKey]}
              </g>
            ))}
          {range && (
            <Range
              range={range}
              height={limitY}
              onHandlerChanged={withHandlers && this.onHandlerChanged}
              parent={this.svgElement}
            />
          )}
        </svg>
        {loading && (
          <div className="smooth-curve__loading">
            <Loader />
          </div>
        )}
        <CSSTransitionGroup
          transitionName="smooth-curve__tooltip__animation"
          transitionLeaveTimeout={300}
          transitionEnterTimeout={300}
        >
          {tooltipInfos &&
            withTooltip &&
            renderTooltip && (
              <div
                className={cx(
                  cSfx('smooth-curve__tooltip', [
                    classSuffix,
                    this.determineTooltipPos(tooltipInfos.x),
                  ])
                )}
                style={{
                  left: tooltipInfos.x,
                  bottom: 0,
                  position: 'absolute',
                  height: '100%',
                }}
                key="smoothCurveTooltip"
                ref={tooltip => {
                  this.tooltip = tooltip;
                }}
              >
                <div
                  className={cx(
                    cSfx('smooth-curve__tooltip__content', [classSuffix])
                  )}
                >
                  {renderTooltip({ ...tooltipInfos })}
                </div>
              </div>
            )}
        </CSSTransitionGroup>
      </div>
    );
  }
}
