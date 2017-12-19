import React from 'react';


// import RUBY_LOGO from '../../assets/integrations/ruby.svg';
const RAILS_LOGO = 'http://rubyonrails.org/images/rails-logo.svg';
// import NODE_LOGO from '../../assets/integrations/node.svg';
const PHP_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/PHP-logo.svg/1280px-PHP-logo.svg.png';
// import HAPI_LOGO from '../../assets/integrations/hapi.svg';
const EXPRESS_LOGO = 'https://i.cloudup.com/zfY6lL7eFa-3000x3000.png';
const WORDPRESS_LOGO = 'https://s.w.org/about/images/logos/wordpress-logo-notext-rgb.png';
const API_LOGO = 'https://access.watch/assets/img/logo-AW-purple.svg';

const INTEGRATIONS = [
  /*
  {
    name: 'Ruby',
    url: 'https://github.com/access-watch/access-watch-ruby',
    logo: RUBY_LOGO,
    manual: {
      steps: [
        {
          title: 'Installation',
          body: _ => (
            <div>
              {'Install the latest version with'}
              <SyntaxHighlighter style={docco}>
                {'gem install access_watch'}
              </SyntaxHighlighter>
              {'or in your Gemfile'}
              <SyntaxHighlighter style={docco}>
                {'gem "access_watch"'}
              </SyntaxHighlighter>
            </div>)
        },
        {
          title: 'Basic Usage',
          body: API_KEY => (
            <div>
              <SyntaxHighlighter language="ruby" style={docco}>
                {
    `client = AccessWatch::Client.new(api_key: ${API_KEY})
    client.post("log", REQUEST_DATA_IN_JSON)`
                }
              </SyntaxHighlighter>
              {'For more infos you can visit the '}
              <a href="https://access.watch/api-documentation/#request-logging">API documentation</a>.
            </div>)
        }
      ]
    },
  },
  */
  {
    id: 'rails',
    name: 'Rails',
    url: 'https://github.com/access-watch/access-watch-rails',
    logo: RAILS_LOGO,
    language: 'ruby',
    manual: {
      steps: [
        {
          title: 'Installation',
          body: _ => (
            <div>
              {'Add in your Gemfile:'}
                {'gem "access_watch_rails"'}
              {'Then run Bundler:'}
                {'bundle install'}
            </div>)
        },
        {
          title: 'Configuration',
          body: API_KEY => (
            <div>
              {'Create the following file config/access_watch.yml'}
              {'Or, if you prefer, add the following line in config/application.rb'}
            </div>)
        },
        {
          title: 'Activation',
          body: _ => (
            <div>
              {'Restart / deploy your application!'}
              <br />&nbsp;<br />
              {'For more information, you can visit:'}
              <br /> <br />
              <a href="https://github.com/access-watch/access-watch-rails">the project page on Github</a>
            </div>)
        },
      ]
    }
  },
  /*
  {
    name: 'Hapi',
    url: 'https://github.com/access-watch/access-watch-hapi',
    logo: HAPI_LOGO,
  },

  {
    name: 'Node',
    url: 'https://github.com/access-watch/access-watch-node',
    logo: NODE_LOGO,
  },
  */
  {
    id: 'express',
    name: 'Express',
    url: 'https://github.com/access-watch/access-watch-middleware',
    logo: EXPRESS_LOGO,
    language: 'node',
    manual: {
      steps: [
        {
          title: 'Installation',
          body: _ => (
            <div>
              {'From the command line:'}
                {'npm install --save access-watch-middleware'}
            </div>)
        },
        {
          title: 'Configuration',
          body: API_KEY => (
            <div>
              {'In your codebase, find the section where you intialise express. It should look like that:'}
                {
`const express = require('express');

const app = express();`
                }
            </div>)
        },
        {
          title: 'Activation',
          body: _ => (
            <div>
              {'Restart / deploy your application!'}
              <br />&nbsp;<br />
              {'For more information, you can visit:'}
              <br /> <br />
              <a href="https://github.com/access-watch/access-watch-middleware">the project page on Github</a>
            </div>)
        },
      ]
    }
  },
  {
    id: 'php',
    name: 'PHP',
    url: 'https://github.com/access-watch/access-watch-php',
    logo: PHP_LOGO,
    language: 'php',
    manual: {
      steps: [
        {
          title: 'Installation',
          body: _ => (
            <div>
              {'From the command line:'}
                {'composer require access-watch/access-watch'}
              {'Or edit your composer.json and add:'}
                {'"access-watch/access-watch": "@stable"'}
              {'Then execute:'}
                {'composer install'}
            </div>)
        },
        {
          title: 'Configuration',
          body: API_KEY => (
            <div>
              {'Add the following code in your codebase, as early as possible, but after composer is loaded.'}
            </div>)
        },
        {
          title: 'Activation',
          body: _ => (
            <div>
              {'Restart / deploy your application!'}
              <br />&nbsp;<br />
              {'For more information, you can visit:'}
              <br /> <br />
              <a href="https://github.com/access-watch/access-watch-php">the project page on Github</a>
            </div>)
        },
      ]
    }
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    url: 'https://wordpress.org/plugins/access-watch/',
    logo: WORDPRESS_LOGO,
    language: 'php',
    manual: {
      steps: [
        {
          title: 'Installation',
          body: (_, SITE_URL) => (
            <div>
              {'Use our assistant to detect your WordPress website:'}
              <div style={{textAlign: 'center'}}>
                <a
                  className="btn btn--integration-manual"
                  href={'https://access.watch/wordpress/install?url=' + encodeURIComponent(SITE_URL)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Install Now
                </a>
              </div>
              {'Or, in the WordPress plugin directory, search for:'}
              {'Then install and activate.'}
            </div>)
        },
        {
          title: 'Configuration',
          body: API_KEY => (
            <div>
              {'Once activated, copy and paste the API Key:'}
                {`${API_KEY}`}
              {'You\'re set!'}
            </div>)
        },
      ]
    }
  },
  {
    id: 'api',
    name: 'API',
    url: 'https://access.watch/api-documentation/',
    logo: API_LOGO,
    language: 'none',
    manual: {
      steps: [
        {
          title: 'Api Key',
          body: API_KEY => (
            <div>
              {'Please first note your Api Key:'}
                {`${API_KEY}`}
            </div>)
        },
        {
          title: 'Documentation',
          body: _ => (
            <div>
              <p>
                Check our <a href="https://access.watch/api-documentation/">API documentation</a>.
                The part about <a href="https://access.watch/api-documentation/#request-logging">Request Logging</a> should be especially interesting.
              </p>
            </div>)
        },
        {
          title: 'Live',
          body: _ => (
            <div>
              <p>You should be able to see the requests in real time in your Dashboard!</p>
            </div>)
        },
      ]
    }
  }
];

export default INTEGRATIONS;
