import { Observable } from '../rx';
import {
  dataEvents,
  viewEvents,
  D_FILTER_GROUPS,
  V_ADD_FILTER_GROUP,
  D_ADD_FILTER_GROUP_SUCCESS,
  D_ADD_FILTER_GROUP_ERROR,
  V_DELETE_FILTER_GROUP,
  D_DELETE_FILTER_GROUP_SUCCESS,
  D_DELETE_FILTER_GROUP_ERROR,
  V_REORDER_FILTER_GROUP,
  D_REORDER_FILTER_GROUP_SUCCESS,
  D_REORDER_FILTER_GROUP_ERROR,
  V_UPDATE_FILTER_GROUP,
  D_UPDATE_FILTER_GROUP_SUCCESS,
  D_UPDATE_FILTER_GROUP_ERROR,
} from '../event_hub';

const INITIAL_STATE = {
  filterGroups: {
    log: [],
    robot: [],
    address: [],
  },
  actionPending: false,
};

const onFilterGroups = Observable.fromEvent(dataEvents, D_FILTER_GROUPS).map(
  ({ filterGroups }) => state => ({
    ...state,
    filterGroups,
  })
);

const getViewObs = action => Observable.fromEvent(viewEvents, action);

const onViewActions = Observable.merge(
  [V_ADD_FILTER_GROUP, V_DELETE_FILTER_GROUP].map(getViewObs)
).map(_ => state => ({
  ...state,
  actionPending: true,
}));

const onAddFilterGroupSuccess = Observable.fromEvent(
  dataEvents,
  D_ADD_FILTER_GROUP_SUCCESS
).map(({ filterGroup, groupId }) => state => ({
  ...state,
  filterGroups: {
    ...state.filterGroups,
    [groupId]: [...state.filterGroups[groupId], filterGroup],
  },
  actionPending: false,
}));

const onAddFilterGroupError = Observable.fromEvent(
  dataEvents,
  D_ADD_FILTER_GROUP_ERROR
).map(() => state => ({
  ...state,
  actionPending: false,
}));

const onDeleteFilterGroupSuccess = Observable.fromEvent(
  dataEvents,
  D_DELETE_FILTER_GROUP_SUCCESS
).map(({ id, groupId }) => state => ({
  ...state,
  filterGroups: {
    ...state.filterGroups,
    [groupId]: state.filterGroups[groupId].filter(
      filterGroup => id !== filterGroup.id
    ),
  },
  actionPending: false,
}));

const onDeleteFilterGroupError = Observable.fromEvent(
  dataEvents,
  D_DELETE_FILTER_GROUP_ERROR
).map(() => state => ({
  ...state,
  actionPending: false,
}));

const reorderState = ({ oldIndex, newIndex, groupId }) => state => {
  const [...filterGroups] = state.filterGroups[groupId];
  const [moving] = filterGroups.splice(oldIndex, 1);
  filterGroups.splice(newIndex, 0, moving);
  return {
    ...state,
    filterGroups: {
      ...state.filterGroups,
      [groupId]: filterGroups,
    },
    actionPending: true,
  };
};

const onReorderFilterGroup = getViewObs(V_REORDER_FILTER_GROUP).map(
  reorderState
);

const onReorderFilterGroupSuccess = getViewObs(
  D_REORDER_FILTER_GROUP_SUCCESS
).map(() => state => ({
  ...state,
  actionPending: false,
}));

const onReorderFilterGroupError = getViewObs(D_REORDER_FILTER_GROUP_ERROR).map(
  ({ oldIndex, newIndex, ...query }) => state => ({
    ...reorderState({ ...query, oldIndex: newIndex, newIndex: oldIndex })(
      state
    ),
    actionPending: false,
  })
);

const onUpdateFilterGroup = getViewObs(V_UPDATE_FILTER_GROUP).map(
  ({ filterGroup, groupId }) => state => ({
    ...state,
    filterGroups: {
      ...state.filterGroups,
      [groupId]: state.filterGroups[groupId].map(
        fg =>
          fg.id === filterGroup.id
            ? {
                ...fg,
                ...filterGroup,
              }
            : fg
      ),
    },
    actionPending: true,
  })
);

const onUpdateFilterGroupResponse = Observable.merge([
  Observable.fromEvent(
    dataEvents,
    D_UPDATE_FILTER_GROUP_SUCCESS,
    D_UPDATE_FILTER_GROUP_ERROR
  ),
]).map(() => state => ({
  ...state,
  actionPending: false,
}));

const filterGroupsReducer$ = Observable.merge(
  onFilterGroups,
  onViewActions,
  onAddFilterGroupSuccess,
  onAddFilterGroupError,
  onDeleteFilterGroupSuccess,
  onDeleteFilterGroupError,
  onReorderFilterGroup,
  onReorderFilterGroupSuccess,
  onReorderFilterGroupError,
  onUpdateFilterGroup,
  onUpdateFilterGroupResponse
);

const filterGroups$ = Observable.of(INITIAL_STATE)
  .merge(filterGroupsReducer$)
  .scan((state, reducer) => reducer(state))
  .publishBehavior();

export default filterGroups$;
