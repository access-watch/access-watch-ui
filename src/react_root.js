import { Observable } from './rx';

// emits the root node to mount the react app into
export default Observable.defer(_ => {
  let reactRoot = document.querySelector('#react-main');
  if (!reactRoot) {
    reactRoot = document.createElement('div');
    reactRoot.id = 'react-main';
    document.body.appendChild(reactRoot);
  }
  return Observable.of(reactRoot);
});
