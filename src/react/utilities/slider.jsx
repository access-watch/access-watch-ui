import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Observable } from 'rxjs';

import '../../../scss/slider.scss';

export default class Slider extends React.Component {
  static propTypes = {
    activeKey: PropTypes.string.isRequired,
    values: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      })
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    handlerSize: PropTypes.number,
    trackHeight: PropTypes.number,
  };

  static defaultProps = {
    className: '',
    handlerSize: 20,
    trackHeight: 5,
  };

  constructor() {
    super();
    this.state = {
      handlerPosition: 0,
      noTransition: true,
    };
    this.onTrackClick = this.onTrackClick.bind(this);
    this.getTrackMargin = this.getTrackMargin.bind(this);
    this.changeHandlerPosTo = this.changeHandlerPosTo.bind(this);
    this.getSliderProperties = this.getSliderProperties.bind(this);
    this.setHandlerToRightPos = this.setHandlerToRightPos.bind(this);
  }

  componentDidMount() {
    this.initDragAndDrop();
    this.setHandlerToRightPos();
  }

  componentWillUnmount() {
    this.destroyDragAndDrop();
  }

  onTrackClick = e => {
    const { left, width, numberOfSteps } = this.getSliderProperties();
    const offset = e.clientX - left;
    const delta = Math.max(offset / width, 0);
    const newActiveStep = Math.min(
      Math.round(delta * numberOfSteps),
      numberOfSteps
    );
    this.setState({ noTransition: false });
    this.changeHandlerPosTo(newActiveStep);
    this.handleChange(this.props.values[newActiveStep].id);
  };

  onKeyDown = ({ which }) => {
    const { values, activeKey } = this.props;
    if (which === 39 || which === 37) {
      const currentPosition = values.findIndex(({ id }) => id === activeKey);
      let newPosition;
      if (which === 39) {
        newPosition = Math.min(currentPosition + 1, values.length - 1);
      } else {
        newPosition = Math.max(currentPosition - 1, 0);
      }
      if (newPosition !== currentPosition) {
        this.changeHandlerPosTo(newPosition);
        this.handleChange(values[newPosition].id);
      }
    }
  };

  getTrackMargin = _ => 16 / (this.props.values.length / 3);

  getSliderProperties() {
    const { left, width } = this.track.getBoundingClientRect();
    const numberOfSteps = this.props.values.length - 1;
    return { left, width, numberOfSteps };
  }

  setHandlerToRightPos() {
    const { values, activeKey } = this.props;
    const activePos = values.findIndex(({ id }) => id === activeKey);
    this.changeHandlerPosTo(activePos);
  }

  changeHandlerPosTo(newActiveStep) {
    const { width, numberOfSteps } = this.getSliderProperties();
    this.setState({
      handlerPosition:
        newActiveStep * width / numberOfSteps - this.props.handlerSize / 2,
    });
  }

  initDragAndDrop() {
    const mouseUp$ = Observable.fromEvent(document, 'mouseup');
    const mousemove$ = Observable.fromEvent(document, 'mousemove');
    const handlerMouseDown$ = Observable.fromEvent(this.handler, 'mousedown');

    const handlerDrag$ = handlerMouseDown$.flatMap(_ =>
      mousemove$
        .map(mm => {
          mm.preventDefault();
          return mm.clientX;
        })
        .takeUntil(mouseUp$)
    );
    this.dragndropSub = handlerDrag$
      .map(pos => {
        const { left, width } = this.getSliderProperties();
        const deltaPos = pos - left;
        return Math.min(Math.max(deltaPos, 0), width - 1);
      })
      .subscribe(pos =>
        this.setState({ handlerPosition: pos, noTransition: true })
      );

    this.changeActiveKeySub = handlerMouseDown$
      .flatMap(_ => mouseUp$.take(1))
      .subscribe(e => {
        this.setState({ noTransition: false });
        this.onTrackClick(e);
      });
  }

  destroyDragAndDrop() {
    this.dragndropSub.unsubscribe();
    this.changeActiveKeySub.unsubscribe();
  }

  handleChange = value => {
    this.props.onChange(value);
  };

  render() {
    const {
      values,
      activeKey,
      className,
      handlerSize,
      trackHeight,
    } = this.props;
    const { handlerPosition, noTransition } = this.state;
    const trackMargin = this.getTrackMargin();
    const transition = noTransition ? 'none' : false;
    const handlerStyle = {
      left: `${handlerPosition}px`,
      width: `${handlerSize}px`,
      height: `${handlerSize}px`,
      top: `${trackHeight / 2 - handlerSize / 2}px`,
      transition,
    };

    return (
      <div
        ref={ref => {
          this.dropdownNode = ref;
        }}
        className={cx('slider', className)}
        role="button"
        onClick={this.onTrackClick}
        onKeyDown={this.onKeyDown}
        tabIndex="0"
      >
        <div className="slider__steps">
          {values.map(({ id, text }) => (
            <div
              key={id}
              className={cx('slider__step', {
                'slider__step--active': id === activeKey,
              })}
            >
              <div className="slider__step__value">{text}</div>
            </div>
          ))}
        </div>
        <div
          className="slider__track-container"
          ref={track => {
            this.track = track;
          }}
          style={{
            height: `${trackHeight}px`,
            margin: `12px ${trackMargin}%`,
          }}
        >
          <div className="slider__track">
            <div
              className="slider__handler"
              ref={handler => {
                this.handler = handler;
              }}
              style={handlerStyle}
            />
          </div>
        </div>
      </div>
    );
  }
}
