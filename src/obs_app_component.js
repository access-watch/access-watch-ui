import React from 'react';

import App from './react/app';
import pageChange$ from './pages';

export default pageChange$.map(({ element, sidePanel, name }) =>
  React.createElement(App, {
    page: element,
    sidePanel,
    name,
  })
);
