import { Observable, Scheduler } from 'rxjs';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { Loader } from 'access-watch-ui-components';

import LogsHeader from './logs_header';
import ScrollTopButton from '../utilities/scroll_top_button';
import LogsEnd from './logs_end';
import { logPropType } from '../prop_types';

import '../../../scss/logs.scss';

export default class Logs extends Component {
  static propTypes = {
    logs: PropTypes.arrayOf(logPropType),
    renderRow: PropTypes.func.isRequired,
    rowHeight: PropTypes.number.isRequired,
    columns: PropTypes.objectOf(PropTypes.string).isRequired,
    // observable emiting the container when availible and then completes
    // the container is the node that is scrollable
    container$: PropTypes.instanceOf(Observable),
    // if the element is fixed positioned
    fixedPos: PropTypes.bool,
    // disable table header?
    noHeader: PropTypes.bool,
    stickyHeader: PropTypes.bool,
    earlierLoading: PropTypes.bool,
    logEnd: PropTypes.bool,
  };

  static defaultProps = {
    logs: [],
    container$: Observable.of(window),
    noHeader: false,
    fixedPos: false,
    stickyHeader: false,
    earlierLoading: false,
    logEnd: false,
  };

  state = {
    autoscroll: false, // If the container should auto scroll when new elements are added
    currIndex: 0, // Index of the element that is currently the first visible in the container
  };

  componentDidMount() {
    // getBoundingCleintReact().top is measured from the top of the viewport no
    // of the page
    const { top } = this.tableBody.getBoundingClientRect();

    // absolute position of the tableBody element
    let pagePos = top;

    if (!this.props.fixedPos) {
      // this logs component is not fix positioned, add the window scroll pos to
      // get the position in the page
      pagePos += window.scrollY;
    }

    this.noneUserScrolling$ = Observable.create(obs => {
      this.noneUserScrollingObserver = obs;
    });

    this.containerInit$ = this.props.container$.take(1).subscribe(container => {
      // The container that will scroll
      this.container = container;

      const containerHeight = container.offsetHeight || container.innerHeight;

      // The number of rows that are assumed to be visible in the view.
      this.visibleRows = Math.round(containerHeight / this.props.rowHeight);

      // extra rows to show above and below the fold
      this.extra = Math.floor(this.visibleRows / 2);
    });

    this.scroll$ = this.props.container$
      .take(1)
      .flatMap(c =>
        Observable.fromEvent(c, 'scroll')
          .withLatestFrom(this.noneUserScrolling$.startWith(0))
          .observeOn(Scheduler.animationFrame)
          .filter(([_, noneUserScrolling]) => c.scrollY !== noneUserScrolling)
          // get the scrolltop or otherwise use scrollY if c is window-ish
          .map(() => c.scrollTop || c.scrollY || 0)
          // find the index of the top visible log item so that we know which
          // entries need to be rendered
          .map(y =>
            Math.min(
              Math.floor((y - pagePos) / this.props.rowHeight),
              this.props.logs.length
            )
          )
          .startWith(0)
          .filter(index => this.state.currIndex !== index)
      )
      .subscribe(index =>
        this.setState({
          currIndex: index,
          autoscroll: index > 0,
        })
      );
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.autoscroll || this.props.logs.length === 0) {
      // dont auto scroll
      return;
    }
    if (this.props.logs.length > nextProps.logs.length) {
      // got brand new logs.. dont do any scrolling
      return;
    }
    // find how many new items will be added with `nextProps` and set `toScroll`
    // accordingly
    const newItemsLength = nextProps.logs.length - this.props.logs.length;
    const toScroll = this.props.rowHeight * newItemsLength;
    const { currIndex: oldIndex } = this.state;
    if (oldIndex) {
      const currIndex = oldIndex + newItemsLength;
      this.setState({ currIndex }, _ => {
        this.toScroll += toScroll;
        this.scrollIfNecessary();
      });
    }
  }

  componentWillUnmount() {
    this.containerInit$.unsubscribe();
    this.scroll$.unsubscribe();
  }

  scrollIfNecessary() {
    if (this.toScroll !== 0 && this.shouldScroll) {
      if (this.container === window) {
        this.noneUserScrollingObserver.next(window.scrollY + this.toScroll);
        window.scrollTo(0, window.scrollY + this.toScroll);
      } else {
        this.container.scrollTop = this.container.scrollTop + this.toScroll;
      }

      this.toScroll = 0;
    } else {
      this.shouldScroll = true;
    }
  }

  shouldScroll = true;
  toScroll = 0;
  visibleRows = 50;
  extra = 0; // extra rows above and below the fold

  render() {
    const {
      columns,
      renderRow,
      logs,
      rowHeight,
      noHeader,
      stickyHeader,
      earlierLoading,
      logEnd,
    } = this.props;
    const { currIndex } = this.state;
    const { visibleRows, extra } = this;

    // add `extra` rows before and after `visibleRows`
    const startIndex = Math.max(currIndex - extra, 0);
    const endIndex = visibleRows + currIndex + extra;

    const slice = logs.slice(startIndex, endIndex);

    const offset = rowHeight * Math.max(currIndex, 0);

    return (
      <div className="logs" style={{ height: (1 + logs.length) * rowHeight }}>
        {!noHeader && (
          <LogsHeader
            rowHeight={rowHeight}
            columns={columns}
            stickyHeader={stickyHeader}
          />
        )}
        <table
          className="logs-table"
          style={{
            transform: `translate3d(0, ${offset}px, 0)`,
          }}
        >
          <colgroup>
            {Object.keys(columns).map(key => (
              <col
                key={key}
                className={cx(
                  'logs__col',
                  `logs__col--${key.replace('.', '-')}`
                )}
              />
            ))}
          </colgroup>
          <tbody
            ref={w => {
              this.tableBody = w;
            }}
          >
            {slice.map((r, i) => renderRow(r, i + startIndex))}
            {(earlierLoading || logEnd) && (
              <tr>
                <td colSpan={Object.keys(columns).length}>
                  <div
                    className="logs__loader-container"
                    style={{ height: rowHeight * 2 }}
                  >
                    {logEnd ? (
                      <LogsEnd />
                    ) : (
                      <div
                        className="logs__loader"
                        style={{
                          height: rowHeight * 1.3,
                          width: rowHeight * 1.3,
                          margin: 'auto',
                        }}
                      >
                        <Loader />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <ScrollTopButton
          onScrollTop={_ => {
            this.toScroll = 0;
            this.shouldScroll = false;
          }}
        />
      </div>
    );
  }
}
