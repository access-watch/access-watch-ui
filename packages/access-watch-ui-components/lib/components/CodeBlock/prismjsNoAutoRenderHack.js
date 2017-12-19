if (typeof document !== 'undefined') {
  // Get the script which will be used by prism.js
  const script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();
  // add the data-manual so prism.js will not render language-* code
  if (script) {
    script.setAttribute('data-manual', true);
  }
}
