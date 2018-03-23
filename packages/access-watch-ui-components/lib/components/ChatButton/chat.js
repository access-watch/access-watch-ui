import EventEmitter from 'events';

import chatKwikCss from '!raw-loader!./chatkwik.css'; //eslint-disable-line

let chatOpened = false;
let kwikChatReady = false;
let openChatEventWaiting = false;
let loadingChat = false;
const lazyLoaded = false;
const eventEmitter = new EventEmitter();
const KWIKCHAT_LOADED = 'kwikchat_loaded';
const KWIKCHAT_READY = 'kwikchat_ready';

const fns = ['openChat', 'loadChat', 'isChatOpen'];

const funcs = {};

const lazyLoad = _ => {
  funcs.internalOpenChat = () => {
    const kcLarr = document.getElementsByClassName('kwikchat__launcher');
    if (kcLarr.length > 0) {
      const kcl = kcLarr[0];
      // kcl.style.display = 'block';
      const kclButton = kcl.getElementsByClassName('launcher__button')[0];
      kclButton.click();
      chatOpened = true;
    }
  };

  funcs.openChat = () => {
    if (kwikChatReady) {
      funcs.internalOpenChat();
    }
    if (!openChatEventWaiting) {
      funcs.loadChat();
      openChatEventWaiting = true;
      eventEmitter.once(KWIKCHAT_READY, () => {
        openChatEventWaiting = false;
        funcs.internalOpenChat();
      });
    }
  };

  funcs.kcBodyNodeObserver = cb =>
    new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          const { addedNodes } = mutation;
          for (let i = 0; i < addedNodes.length; i++) {
            if (addedNodes[i].id === 'kwikchat') {
              eventEmitter.emit(KWIKCHAT_LOADED);
              cb(addedNodes[i]);
            }
          }
        }
      });
    });

  funcs.kwikchatNodeObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes') {
        if (!kwikChatReady) {
          eventEmitter.emit(KWIKCHAT_READY);
          kwikChatReady = true;
          funcs.kwikchatNodeObserver.disconnect();
        }
      }
    });
  });

  funcs.startKwikchatObserver = kcn => {
    funcs.kwikchatNodeObserver.observe(kcn, {
      attributes: true,
      subtree: true,
    });
  };

  funcs.whenKwikchatReady = () =>
    new Promise(resolve => {
      if (kwikChatReady) {
        resolve(true);
      }
      const observer = funcs.kcBodyNodeObserver(funcs.startKwikchatObserver);
      observer.observe(document.getElementsByTagName('body')[0], {
        childList: true,
      });
      eventEmitter.once(KWIKCHAT_READY, () => {
        resolve(true);
        observer.disconnect();
      });
    });

  eventEmitter.once(KWIKCHAT_LOADED, () => {
    const css = document.createElement('style');
    css.innerHTML = chatKwikCss;
    document.head.appendChild(css);
  });

  funcs.loadChat = () => {
    if (loadingChat || kwikChatReady) {
      return;
    }
    const s = document.createElement('script');
    s.setAttribute(
      'src',
      'https://cdn.chatkwik.com/cdn/widget/f945ebd210e1a0d8eb6a669f5591b60e7015631fe4c5a78d236f80461e8015ea'
    );
    s.onload = () => {
      funcs.whenKwikchatReady().then(() => {
        Array.prototype.forEach.call(
          document
            .getElementById('kwikchat')
            .getElementsByClassName('header__button'),
          button => {
            button.addEventListener('click', e => {
              e.preventDefault();
              chatOpened = false;
            });
          }
        );
      });
    };
    document.head.insertBefore(s, document.head.children[0]);
    loadingChat = true;
  };

  funcs.isChatOpen = () => chatOpened;
};

// We want to lazy load all this so it is only executed when needed + not executed on the server side
const fnsWithLazyload = fns.reduce(
  (acc, fnKey) => ({
    ...acc,
    [fnKey]: () => {
      if (!lazyLoaded) {
        lazyLoad();
      }
      return funcs[fnKey]();
    },
  }),
  {}
);

const { openChat, loadChat, isChatOpen } = fnsWithLazyload;

export { openChat, loadChat, isChatOpen };
