const removeOldTimerangeReducer = state => {
  if (state) {
    const { timerangeFrom, timerangeTo } = state;
    if (timerangeFrom && timerangeTo) {
      const olderDate = new Date(parseInt(timerangeFrom, 10));
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (olderDate < yesterday) {
        return { ...state };
      }
      return { ...state, timerangeFrom, timerangeTo };
    }
  }
  return { ...state };
};

const localStorageReducers = {
  g: [removeOldTimerangeReducer],
};

class RouterStateStore {
  constructor(localStorageId, routeConfig) {
    this.routeConfig = routeConfig;
    this.localStorageId = localStorageId;
    this.init();
  }

  init() {
    this.state = Object.keys(localStorageReducers).reduce(
      (fullState, reducersKey) => ({
        ...fullState,
        [reducersKey]: localStorageReducers[reducersKey].reduce(
          (state, reduce) => reduce(state),
          fullState[reducersKey]
        ),
      }),
      this.getStateFromLocalStorage()
    );
  }

  getStateFrom(stateName, key) {
    const state = this.state[stateName];
    if (state) {
      return state[key];
    }
    return undefined;
  }

  setStateOf(stateName, key, value) {
    const state = this.state[stateName];
    if (!state) {
      this.state[stateName] = { [key]: value };
    } else {
      this.state[stateName][key] = value;
    }
  }

  setRouteState(routeName, key, value) {
    const routeConfig = this.routeConfig[routeName];
    const propType = routeConfig[key];
    if (propType) {
      if (propType === 'g') {
        this.setStateOf('g', key, value);
      } else {
        this.setStateOf(routeName, key, value);
      }
      this.persistStateInLocalStorage();
      return true;
    }
    return false;
  }

  removeRouteState(routeName, key) {
    const routeConfig = this.routeConfig[routeName];
    const propType = routeConfig[key];
    if (propType) {
      if (propType === 'g') {
        delete this.state.g[key];
      } else {
        delete this.state[routeName][key];
      }
      this.persistStateInLocalStorage();
      return true;
    }
    return false;
  }

  getRouteState(routeName) {
    const routeConfig = this.routeConfig[routeName];
    if (!routeConfig) {
      return {};
    }
    return Object.keys(routeConfig).reduce((acc, key) => {
      let curItem;
      if (routeConfig[key] === 'g') {
        curItem = this.getStateFrom('g', key);
      } else {
        curItem = this.getStateFrom(routeName, key);
      }
      return {
        ...acc,
        [key]: curItem,
      };
    }, {});
  }

  updateRouteState(routeName, state) {
    const fromStateProps = {};
    if (this.routeConfig[routeName]) {
      const persistedRouteState = this.getRouteState(routeName);
      const persistedProps = Object.keys(this.routeConfig[routeName]);
      persistedProps.forEach(k => {
        const persistedValue = persistedRouteState[k];
        const updatedValue = state[k];
        if (!(!persistedValue && !updatedValue)) {
          if (!updatedValue) {
            if (this.lastVisitedRoute === routeName) {
              this.removeRouteState(routeName, k);
            } else {
              fromStateProps[k] = persistedValue;
            }
          } else if (persistedValue !== updatedValue) {
            this.setRouteState(routeName, k, updatedValue);
          }
        }
      });
    }
    this.lastVisitedRoute = routeName;
    return fromStateProps;
  }

  getStateFromLocalStorage() {
    try {
      const state = localStorage.getItem(this.localStorageId);
      if (state === null) {
        return {};
      }
      return JSON.parse(state);
    } catch (err) {
      return {};
    }
  }

  persistStateInLocalStorage() {
    try {
      if (this.state) {
        localStorage.setItem(this.localStorageId, JSON.stringify(this.state));
      }
      return true;
    } catch (err) {
      return false;
    }
  }
}

export default RouterStateStore;
