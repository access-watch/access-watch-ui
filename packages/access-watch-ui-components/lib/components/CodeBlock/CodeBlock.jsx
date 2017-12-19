import React from 'react';
import PropTypes from 'prop-types';
import CopyToClipboard from 'react-copy-to-clipboard';

import './prismjsNoAutoRenderHack';

import refractor from 'refractor/core';
import javascript from 'refractor/lang/javascript';
import yaml from 'refractor/lang/yaml';
import ruby from 'refractor/lang/ruby';
import php from 'refractor/lang/php';
import json from 'refractor/lang/json';
import batch from 'refractor/lang/batch';
import 'prismjs/themes/prism.css';

import Alert from '../Alert';
import CopySVG from '!svg-react-loader!./copy-text.svg'; //eslint-disable-line

import './CodeBlock.scss';
import './aw_prism.scss';

refractor.register(javascript);
refractor.register(yaml);
refractor.register(ruby);
refractor.register(php);
refractor.register(json);
refractor.register(batch);

const ALERT_DISPLAY_TIME = 2000;

const createRefractorElement = ({type, tagName, properties, children, value}, i) => (
  type === 'element' ?
    React.createElement(tagName, {className: properties.className.join(' '), key: i}, children ? children.map(createRefractorElement) : [])
  : value
);

export default class CodeBlock extends React.Component {
  static propTypes = {
    language: PropTypes.string,
    children: PropTypes.node,
  }

  state = {}

  showAlert = _ => {
    if (this.state.timeout) {
      window.clearTimeout(this.state.timeout);
    }
    const timeout = window.setTimeout(this.clearAlert, ALERT_DISPLAY_TIME);
    this.setState({showAlert: true, timeout});
  }

  clearAlert = _ => {
    this.setState({showAlert: false, timeout: undefined});
  }

  render() {
    const {language, children} = this.props;
    const {showAlert} = this.state;
    return (
      <div className="code-block">
        <pre className={`language-${language} code-block__content`}>
          <code className={`language-${language}`}>
            {language ?
              refractor.highlight(children, language).map(createRefractorElement)
              : children
            }
          </code>
        </pre>
        <CopyToClipboard text={children} onCopy={this.showAlert}>
          <CopySVG className="code-block__copy" />
        </CopyToClipboard>
        {showAlert &&
          <Alert type="success" onClose={this.clearTimeout}>
            Snippet successfully copied to your clipboard.
          </Alert>
        }
      </div>
    );
  }
}
