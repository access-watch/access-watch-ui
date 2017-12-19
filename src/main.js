import ReactDOM from 'react-dom';

import { Observable } from './rx';
import { initRouter, rootRoute$ } from './router';
import reactRoot$ from './react_root';
import appComponent$ from './obs_app_component';
import './api_manager';
import { V_SET_ROUTE, dispatch } from './event_hub';

rootRoute$.subscribe(_ => {
  dispatch({ type: V_SET_ROUTE, route: '/status' });
});

Observable.combineLatest(reactRoot$, appComponent$).subscribe(
  ([reactRoot, mainComponent]) => {
    if (__DEV__) {
      try {
        ReactDOM.render(mainComponent, reactRoot);
      } catch (e) {
        // eslint-disable-next-line
        console.error(e.stack);
      }
    } else {
      ReactDOM.render(mainComponent, reactRoot);
    }
  },
  err => {
    // just printing error for now. At some point we could render error
    // pages/send app state to our api etc.
    // eslint-disable-next-line
    console.error(err);
  }
);

// Start publishing routing events and current page
initRouter();
