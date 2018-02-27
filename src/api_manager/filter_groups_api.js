import { poll, api } from './api';
import {
  viewEvents,
  dataEvents,
  V_ADD_FILTER_GROUP,
  D_FILTER_GROUPS,
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

const getFilterGroups = () => api.get('/filter_groups');

const emitFilterGroups = filterGroups => {
  dataEvents.emit(D_FILTER_GROUPS, { filterGroups });
};

const updateFilterGroups = () => getFilterGroups().then(emitFilterGroups);

export const getFilterGroupsObs = (_, pollInterval = 5000) =>
  poll(updateFilterGroups, pollInterval);

export const postFilterGroup = ({ groupId, filterGroup }) =>
  api.post(`/filter_groups/${groupId}`, filterGroup);

export const deleteFilterGroup = ({ groupId, id }) =>
  api.delete(`/filter_groups/${groupId}/${id}`);

export const updateFilterGroup = ({ groupId, filterGroup }) =>
  api.post(`/filter_groups/${groupId}/${filterGroup.id}`, filterGroup);

export const reorderFilterGroup = ({ groupId, ...reorderProps }) =>
  api.post(`/filter_groups/${groupId}/reorder`, reorderProps);

const handleViewEvents = ({ viewEvent, successEvent, errorEvent, apiFn }) =>
  viewEvents.on(viewEvent, args => {
    apiFn(args)
      .then(() => {
        dataEvents.emit(successEvent, args);
      })
      .catch(err => {
        dataEvents.emit(errorEvent, err);
      });
  });

handleViewEvents({
  viewEvent: V_ADD_FILTER_GROUP,
  successEvent: D_ADD_FILTER_GROUP_SUCCESS,
  errorEvent: D_ADD_FILTER_GROUP_ERROR,
  apiFn: postFilterGroup,
});

handleViewEvents({
  viewEvent: V_DELETE_FILTER_GROUP,
  successEvent: D_DELETE_FILTER_GROUP_SUCCESS,
  errorEvent: D_DELETE_FILTER_GROUP_ERROR,
  apiFn: deleteFilterGroup,
});

handleViewEvents({
  viewEvent: V_UPDATE_FILTER_GROUP,
  successEvent: D_UPDATE_FILTER_GROUP_SUCCESS,
  errorEvent: D_UPDATE_FILTER_GROUP_ERROR,
  apiFn: updateFilterGroup,
});

viewEvents.on(V_REORDER_FILTER_GROUP, query => {
  reorderFilterGroup(query)
    .then(() => {
      dataEvents.emit(D_REORDER_FILTER_GROUP_SUCCESS, null);
    })
    .catch(error => {
      dataEvents.emit(D_REORDER_FILTER_GROUP_ERROR, { error, query });
    });
});
