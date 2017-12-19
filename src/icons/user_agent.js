/*eslint-disable*/

// Browsers
import UA_CHROME_SVG from '!raw-loader!../../assets/16-chrome.svg';
import UA_EDGE_SVG from '!raw-loader!../../assets/16-edge.svg';
import UA_EXPLORER_SVG from '!raw-loader!../../assets/16-iexplorer.svg';
import UA_FIREFOX_SVG from '!raw-loader!../../assets/16-firefox.svg';
import UA_OPERA_SVG from '!raw-loader!../../assets/16-opera.svg';
import UA_SAFARI_SVG from '!raw-loader!../../assets/16-safari.svg';
import UA_YANDEX_BROWSER_SVG from '!raw-loader!../../assets/16-yandex.svg';

// Fallback when none found
import UA_PLACEHOLDER_SVG from '!raw-loader!../../assets/16-placeholder.svg';

// Assumed to be faked user agent
import UA_MASK_SVG from '!raw-loader!../../assets/16-mask.svg';
/* eslint-enable */

export const userAgentIcons = {
  // Browsers
  chrome: UA_CHROME_SVG,
  edge: UA_EDGE_SVG,
  explorer: UA_EXPLORER_SVG,
  firefox: UA_FIREFOX_SVG,
  opera: UA_OPERA_SVG,
  safari: UA_SAFARI_SVG,
  yandexbrowser: UA_YANDEX_BROWSER_SVG,
};

export const getUserAgentIconSvg = (
  { identity, user_agent: ua, reputation },
  fallback = UA_PLACEHOLDER_SVG
) => {
  let svg = fallback;
  if (ua && ua.agent && ua.agent.name) {
    const { name } = ua.agent;
    if (userAgentIcons[name]) {
      svg = userAgentIcons[name];
    }
  }

  if (identity && identity.type === 'robot') {
    if (ua && ua.type === 'browser') {
      svg = UA_PLACEHOLDER_SVG;
    }
  }

  if (reputation && reputation.status === 'bad') {
    if (ua && ua.type === 'browser') {
      svg = UA_MASK_SVG;
    }
    if (ua && ua.agent && ua.agent.name) {
      if (
        ua.agent.name === 'google' ||
        ua.agent.name === 'baidu' ||
        ua.agent.name === 'php'
      ) {
        svg = UA_MASK_SVG;
      }
    }
  }

  if (reputation && reputation.status === 'suspicious') {
    svg = UA_PLACEHOLDER_SVG;
  }

  return svg;
};
