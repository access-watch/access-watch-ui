import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

export default class SearchLogs extends React.Component {
  static propTypes = {
    query: PropTypes.string,
    onSearch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    query: '',
  };

  state = {
    inputValue: '',
  };

  componentWillMount() {
    this.setState({
      inputValue: this.props.query || '',
    });
  }

  handleSearchInputChange = () => {
    this.setState({
      inputValue: this.searchInput.value,
    });
  };

  handleSearchBtnClick = e => {
    e.preventDefault();
    const { inputValue } = this.state;
    const { onSearch } = this.props;
    onSearch(inputValue);
    this.searchInput.blur();
  };

  handleClearSearch = _ => {
    const { onSearch } = this.props;
    this.setState({
      inputValue: '',
    });
    onSearch('');
  };

  handleFocus = _ => {
    this.searchInput.select();
  };

  render() {
    const { query } = this.props;
    return (
      <div className="search-logs">
        <form
          className="search-logs__form"
          onSubmit={this.handleSearchBtnClick}
        >
          <input
            type="text"
            spellCheck={false}
            placeholder="Search..."
            ref={ipt => {
              this.searchInput = ipt;
            }}
            onChange={this.handleSearchInputChange}
            value={this.state.inputValue}
            onFocus={this.handleFocus}
          />
        </form>
        <button
          onClick={this.handleClearSearch}
          title="Clear search input"
          className={cx('search-logs__clear', {
            'search-logs__clear--visible': query,
          })}
        />
      </div>
    );
  }
}
