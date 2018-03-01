import { Observable } from '../rx';
import {
  dataEvents,
  viewEvents,
  D_SEARCHS,
  V_ADD_SEARCH,
  D_ADD_SEARCH_SUCCESS,
  D_ADD_SEARCH_ERROR,
  V_DELETE_SEARCH,
  D_DELETE_SEARCH_SUCCESS,
  D_DELETE_SEARCH_ERROR,
  V_REORDER_SEARCH,
  D_REORDER_SEARCH_SUCCESS,
  D_REORDER_SEARCH_ERROR,
  V_UPDATE_SEARCH,
  D_UPDATE_SEARCH_SUCCESS,
  D_UPDATE_SEARCH_ERROR,
} from '../event_hub';

const INITIAL_STATE = {
  searches: {
    log: [],
    robot: [],
    address: [],
  },
  actionPending: false,
};

const onSearches = Observable.fromEvent(dataEvents, D_SEARCHS).map(
  ({ searches }) => state => ({
    ...state,
    searches,
  })
);

const getViewObs = action => Observable.fromEvent(viewEvents, action);

const onViewActions = Observable.merge(
  [V_ADD_SEARCH, V_DELETE_SEARCH].map(getViewObs)
).map(_ => state => ({
  ...state,
  actionPending: true,
}));

const onAddSearchSuccess = Observable.fromEvent(
  dataEvents,
  D_ADD_SEARCH_SUCCESS
).map(({ search, groupId }) => state => ({
  ...state,
  searches: {
    ...state.searches,
    [groupId]: [...state.searches[groupId], search],
  },
  actionPending: false,
}));

const onAddSearchError = Observable.fromEvent(
  dataEvents,
  D_ADD_SEARCH_ERROR
).map(() => state => ({
  ...state,
  actionPending: false,
}));

const onDeleteSearchSuccess = Observable.fromEvent(
  dataEvents,
  D_DELETE_SEARCH_SUCCESS
).map(({ id, groupId }) => state => ({
  ...state,
  searches: {
    ...state.searches,
    [groupId]: state.searches[groupId].filter(
      search => id !== search.id
    ),
  },
  actionPending: false,
}));

const onDeleteSearchError = Observable.fromEvent(
  dataEvents,
  D_DELETE_SEARCH_ERROR
).map(() => state => ({
  ...state,
  actionPending: false,
}));

const reorderState = ({ oldIndex, newIndex, groupId }) => state => {
  const [...searches] = state.searches[groupId];
  const [moving] = searches.splice(oldIndex, 1);
  searches.splice(newIndex, 0, moving);
  return {
    ...state,
    searches: {
      ...state.searches,
      [groupId]: searches,
    },
    actionPending: true,
  };
};

const onReorderSearch = getViewObs(V_REORDER_SEARCH).map(
  reorderState
);

const onReorderSearchSuccess = getViewObs(
  D_REORDER_SEARCH_SUCCESS
).map(() => state => ({
  ...state,
  actionPending: false,
}));

const onReorderSearchError = getViewObs(D_REORDER_SEARCH_ERROR).map(
  ({ oldIndex, newIndex, ...query }) => state => ({
    ...reorderState({ ...query, oldIndex: newIndex, newIndex: oldIndex })(
      state
    ),
    actionPending: false,
  })
);

const onUpdateSearch = getViewObs(V_UPDATE_SEARCH).map(
  ({ search, groupId }) => state => ({
    ...state,
    searches: {
      ...state.searches,
      [groupId]: state.searches[groupId].map(
        fg =>
          fg.id === search.id
            ? {
                ...fg,
                ...search,
              }
            : fg
      ),
    },
    actionPending: true,
  })
);

const onUpdateSearchResponse = Observable.merge([
  Observable.fromEvent(
    dataEvents,
    D_UPDATE_SEARCH_SUCCESS,
    D_UPDATE_SEARCH_ERROR
  ),
]).map(() => state => ({
  ...state,
  actionPending: false,
}));

const searchesReducer$ = Observable.merge(
  onSearches,
  onViewActions,
  onAddSearchSuccess,
  onAddSearchError,
  onDeleteSearchSuccess,
  onDeleteSearchError,
  onReorderSearch,
  onReorderSearchSuccess,
  onReorderSearchError,
  onUpdateSearch,
  onUpdateSearchResponse
);

const searches$ = Observable.of(INITIAL_STATE)
  .merge(searchesReducer$)
  .scan((state, reducer) => reducer(state))
  .publishBehavior();

export default searches$;
