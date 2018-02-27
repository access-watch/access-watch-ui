import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import '../../../scss/tabs.scss';

class Tabs extends React.Component {
  static propTypes = {
    tabs: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        children: PropTypes.node.isRequired,
      })
    ).isRequired,
    onTabClose: PropTypes.func.isRequired,
    currentTab: PropTypes.string.isRequired,
    onOrderChange: PropTypes.func.isRequired,
    onTabClick: PropTypes.func.isRequired,
  };

  handleDragEnd = ({ source, destination }) => {
    if (!destination) {
      return;
    }
    const { onOrderChange } = this.props;
    onOrderChange({ oldIndex: source.index, newIndex: destination.index });
  };

  render() {
    const { tabs, onTabClose, currentTab, onTabClick } = this.props;
    const notDraggableCount = tabs.filter(({ notDraggable }) => notDraggable)
      .length;
    return (
      <DragDropContext onDragEnd={this.handleDragEnd}>
        <Droppable droppableId="tabs" type="TAB" direction="horizontal">
          {dropProvided => (
            <div className="aw-tabs" ref={dropProvided.innerRef}>
              {tabs.map(({ id, children, notDraggable, notCloseable }, i) => {
                const onClick = e => {
                  onTabClick({ id }, e);
                };
                const tab = (
                  <div
                    className={cx('aw-tab', {
                      'aw-tab--active': id === currentTab,
                    })}
                    onClick={onClick}
                    onKeyPress={onClick}
                    key={id}
                  >
                    <button className="aw-tab__label">{children}</button>
                    {!notCloseable && (
                      <button
                        className="aw-tab__close"
                        onClick={e => {
                          e.stopPropagation();
                          onTabClose({ id }, e);
                        }}
                      />
                    )}
                  </div>
                );
                return notDraggable ? (
                  tab
                ) : (
                  <Draggable
                    draggableId={`tab-${id}`}
                    type="TAB"
                    index={i - notDraggableCount}
                    key={id}
                  >
                    {dragProvided => (
                      <div>
                        {React.cloneElement(tab, {
                          ...dragProvided.draggableProps,
                          ...dragProvided.dragHandleProps,
                          ref: dragProvided.innerRef,
                          onClick,
                        })}
                        {dragProvided.placeholder}
                      </div>
                    )}
                  </Draggable>
                );
              })}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

export default Tabs;
