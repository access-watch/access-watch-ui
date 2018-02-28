import React from 'react';
import PropTypes from 'prop-types';
import Downshift from 'downshift';
import cx from 'classnames';

import './Autocomplete.scss';

const baseClass = 'auto-complete';
const itemsClass = `${baseClass}__items`;
const itemClass = `${baseClass}__item`;

const highlightFirst = (inputValue, { setHighlightedIndex, ...args }) => {
  if (inputValue) {
    setHighlightedIndex(0);
  }
};

const itemToString = item => (item ? item.label || item.value : '');

const Autocomplete = ({ items, inputRef, onKeyDown, ...downshiftProps }) => (
  <Downshift
    onInputValueChange={highlightFirst}
    {...downshiftProps}
    itemToString={itemToString}
    render={({
      getInputProps,
      getItemProps,
      isOpen,
      inputValue,
      selectedItem,
      highlightedIndex,
      selectItem,
      reset,
    }) => {
      const renderedItems = isOpen
        ? items.filter(({ label }) =>
            ('' + label).toLowerCase().includes(inputValue.toLowerCase())
          )
        : [];
      return (
        <div className={baseClass}>
          <input
            {...getInputProps({
              ref: inputRef,
              ...(onKeyDown
                ? {
                    onKeyDown: e =>
                      onKeyDown(e, {
                        reset,
                        highlightedItem: renderedItems[highlightedIndex],
                      }),
                  }
                : {}),
            })}
          />
          {isOpen ? (
            <div className={itemsClass}>
              {renderedItems.map((item, index) => {
                const { onClick, ...itemProps } = getItemProps({ item });
                return (
                  <div
                    className={cx(itemClass, {
                      [`${itemClass}--highlight`]: highlightedIndex === index,
                      [`${itemClass}--selected`]:
                        selectedItem && selectedItem.id === item.id,
                    })}
                    {...itemProps}
                    onClick={e => {
                      e.stopPropagation();
                      onClick(e);
                    }}
                    key={item.value}
                  >
                    {item.label}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      );
    }}
  />
);

Autocomplete.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      id: PropTypes.string,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  inputRef: PropTypes.func,
  onKeyDown: PropTypes.func,
};

Autocomplete.defaultProps = {
  inputRef: _ => _,
  onKeyPressed: _ => _,
};

export default Autocomplete;
