## Usage

* `npm start`: Runs a webpack dev server. Point browser to
  http://localhost:8080/main.
* `npm run lint`: Runs eslint. This has to pass for CI to be successful.
* `npm test[:watch]`: Runs tests. This has to pass for CI to be successful.
* `npm run build[:staging]`: Builds for production, :staging is unminified
* `npm run prettier[|:watch]`: Runs prettier

### Environment variables

Environment variables are read during build time and injected by webpack.

* `API_BASE_URL=http://127.0.0.1:8000/1.0/etc`: API base url (default: "http://localhost:3000")
* `NODE_ENV=production`: (default: "")
* `WEBSOCKET_BASE_URL=ws://access.watch:8888`: (default: "ws://localhost:3000")

### Development

If you are developing on the project, you may find yourself wanting to modify
some components coming from the shared components library `access-watch-ui-components`.
To install `node_modules` for both projects, you can `lerna bootstrap`.
You can easily link the dependency with lerna (`lerna link`) to see your modifications in the main ui.

### Publishing

To publish a new version to npm, you should use `lerna publish`.
Though in most cases, you will only have modified the UI itself, not the `access-watch-ui-components` package.
In such case, you want to only publish this package.
You can do so with `lerna publish --scope access-watch-ui`.
