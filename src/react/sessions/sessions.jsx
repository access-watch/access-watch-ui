import React from 'react';
import PropTypes from 'prop-types';

import { V_SET_ROUTE, dispatch } from '../../event_hub';
import { updateRouteParameter } from '../../utilities/route_utils';
import { pickKeys } from '../../utilities/object';

import { sessionsToTreemap } from './treemap_tools';
import { treemapResolvers as commonTreemapResolvers } from './resolvers';

import SessionBlock from './session_block';
import LoadingIcon from '../utilities/loading_icon';
import Table from '../table/table';
import { routePropType } from '../prop_types';
import { TableResolversPropTypes } from '../table/prop_types';

import '../../../scss/sessions/sessions.scss';

const commonTreemapProps = [
  'id',
  'width',
  'height',
  'x',
  'y',
  'count',
  'updated',
  'speed',
  'blocked',
];
const treemapResolversPropsArr = ['title', 'country', 'type', 'reputation'];

const treemapResolversProps = Object.keys(treemapResolversPropsArr).reduce(
  (propTypes, k) => ({
    ...propTypes,
    [k]: PropTypes.func,
  }),
  {}
);

class Sessions extends React.Component {
  static propTypes = {
    sessions: PropTypes.shape({
      sessions: PropTypes.array.isRequired,
      loading: PropTypes.bool.isRequired,
    }).isRequired,
    tableResolvers: TableResolversPropTypes.isRequired,
    treemapResolvers: PropTypes.shape(treemapResolversProps).isRequired,
    emptyMessage: PropTypes.string.isRequired,
    route: routePropType.isRequired,
    rowClassResolver: PropTypes.func,
  };

  static defaultProps = {
    rowClassResolver: _ => '',
  };

  handleSortChange = value => {
    const { route: { route, sort } } = this.props;
    if (sort !== value) {
      dispatch({
        type: V_SET_ROUTE,
        route: updateRouteParameter({ route, param: 'sort', value }),
      });
    }
  };

  handleSessionClick = id => {
    const { route: { route } } = this.props;
    // Replacing the ':' (which can appear in IPv6 address) as somehow our router cannot process it
    dispatch({
      type: V_SET_ROUTE,
      route: `${route.split('?')[0]}/${id.replace(/:/g, '_')}`,
    });
  };

  render() {
    const {
      sessions: { sessions, loading },
      tableResolvers,
      emptyMessage,
      route,
      rowClassResolver,
    } = this.props;
    const { visType, sort } = route;
    const onSessionClick = this.handleSessionClick;
    const treemapResolvers = {
      ...this.props.treemapResolvers,
      ...commonTreemapResolvers,
    };
    const treemapLimit =
      window.innerWidth > 1440 && window.innerHeight > 900 ? 30 : 15;

    return (
      <div className="sessions">
        {visType === 'treemap' && (
          <div className="sessions__items">
            {sessions.length > 0 &&
              sessionsToTreemap(sessions.slice(0, treemapLimit)).map(block => (
                <SessionBlock
                  onClick={onSessionClick}
                  key={block.id}
                  {...Object.keys(treemapResolvers).reduce(
                    (treemapProps, k) => ({
                      ...treemapProps,
                      [k]: treemapResolvers[k](block),
                    }),
                    pickKeys(commonTreemapProps)(block)
                  )}
                />
              ))}
          </div>
        )}
        {visType === 'table' && (
          <Table
            entries={sessions}
            resolvers={tableResolvers}
            onSortChange={this.handleSortChange}
            currentSort={sort}
            onEntryClick={onSessionClick}
            rowClassResolver={rowClassResolver}
          />
        )}
        {loading && (
          <div className="loading-box">
            <LoadingIcon message="Getting your data ready ..." />
          </div>
        )}
        {!loading &&
          sessions.length === 0 && (
            <div className="loading-box">
              <p
                style={{
                  position: 'relative',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                {emptyMessage}
              </p>
            </div>
          )}
      </div>
    );
  }
}

export default Sessions;
