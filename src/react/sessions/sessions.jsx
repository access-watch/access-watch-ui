import React from 'react';
import PropTypes from 'prop-types';

import { V_SET_ROUTE, V_SESSIONS_LOAD_MORE, dispatch } from '../../event_hub';
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
      end: PropTypes.bool,
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

  state = {};

  componentWillReceiveProps({ sessions: { loading: nextLoading } }) {
    const { loading } = this.state;
    const { sessions: { loading: prevLoading } } = this.props;
    if (loading && !nextLoading && prevLoading) {
      this.setState({ loading: false });
    }
  }

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

  loadMoreSessions = () => {
    const { loading } = this.state;
    const { end } = this.props.sessions;
    if (!loading && !end) {
      this.setState({ loading: true });
      dispatch({
        type: V_SESSIONS_LOAD_MORE,
      });
    }
  };

  render() {
    const {
      sessions: { sessions, loading, end },
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
            onScrollNearBottom={this.loadMoreSessions}
            loadingMore={loading}
            end={end}
          />
        )}
        {sessions.length === 0 &&
          (loading ? (
            <div className="loading-box">
              <LoadingIcon message="Getting your data ready ..." />
            </div>
          ) : (
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
          ))}
      </div>
    );
  }
}

export default Sessions;
