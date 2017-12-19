import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

export default class LogsHeader extends React.Component {
  static propTypes = {
    rowHeight: PropTypes.number.isRequired,
    columns: PropTypes.objectOf(PropTypes.string).isRequired,
    stickyHeader: PropTypes.bool,
  };

  static defaultProps = {
    stickyHeader: false,
  };

  state = {
    affix: false,
  };

  componentDidMount = _ => {
    window.addEventListener('scroll', this.handleScroll);
  };

  componentWillUnmount = _ => {
    window.removeEventListener('scroll', this.handleScroll);
  };

  handleScroll = _ => {
    if (!this.props.stickyHeader) {
      return;
    }

    const { affix } = this.state;
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const parent = this.tableNode.parentNode;
    const { offsetTop } = parent;

    if (!affix && scrollTop >= offsetTop) {
      this.setState({
        affix: true,
      });
    }

    if (affix && scrollTop < offsetTop) {
      this.setState({
        affix: false,
      });
    }
  };

  render() {
    const { columns, rowHeight } = this.props;
    const { affix } = this.state;

    return (
      <table
        ref={ref => {
          this.tableNode = ref;
        }}
        className={cx('logs-table', { 'logs-table--fixed': affix })}
      >
        <thead>
          <tr className="logs__row" style={{ height: rowHeight }}>
            {Object.keys(columns).map(key => (
              <th
                className={`logs__col logs__col--${key.replace('.', '-')}`}
                key={key}
              >
                {columns[key]}
              </th>
            ))}
          </tr>
        </thead>
      </table>
    );
  }
}
