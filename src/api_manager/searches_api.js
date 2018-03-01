import { poll, api } from './api';
import {
  viewEvents,
  dataEvents,
  V_ADD_SEARCH,
  D_SEARCHS,
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

const getSearches = () => api.get('/searches');

const emitSearches = searches => {
  dataEvents.emit(D_SEARCHS, { searches });
};

const updateSearches = () => getSearches().then(emitSearches);

export const getSearchesObs = (_, pollInterval = 5000) =>
  poll(updateSearches, pollInterval);

export const postSearch = ({ groupId, search }) =>
  api.post(`/searches/${groupId}`, search);

export const deleteSearch = ({ groupId, id }) =>
  api.delete(`/searches/${groupId}/${id}`);

export const updateSearch = ({ groupId, search }) =>
  api.post(`/searches/${groupId}/${search.id}`, search);

export const reorderSearch = ({ groupId, ...reorderProps }) =>
  api.post(`/searches/${groupId}/reorder`, reorderProps);

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
  viewEvent: V_ADD_SEARCH,
  successEvent: D_ADD_SEARCH_SUCCESS,
  errorEvent: D_ADD_SEARCH_ERROR,
  apiFn: postSearch,
});

handleViewEvents({
  viewEvent: V_DELETE_SEARCH,
  successEvent: D_DELETE_SEARCH_SUCCESS,
  errorEvent: D_DELETE_SEARCH_ERROR,
  apiFn: deleteSearch,
});

handleViewEvents({
  viewEvent: V_UPDATE_SEARCH,
  successEvent: D_UPDATE_SEARCH_SUCCESS,
  errorEvent: D_UPDATE_SEARCH_ERROR,
  apiFn: updateSearch,
});

viewEvents.on(V_REORDER_SEARCH, query => {
  reorderSearch(query)
    .then(() => {
      dataEvents.emit(D_REORDER_SEARCH_SUCCESS, null);
    })
    .catch(error => {
      dataEvents.emit(D_REORDER_SEARCH_ERROR, { error, query });
    });
});
