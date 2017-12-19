import { Observable, Scheduler } from '../rx';

/**
 * Key name to keycode mappings.
 */
export const KEY_CODE = {
  ESC: 27,
};

const filterKeyBuilder = ePropName => propVal => e => e[ePropName] === propVal;
/**
 * Filter a keyboard event that equals the key code, `which`
 */
const filterKeyByWhich = filterKeyBuilder('which');

const filterKeyByKey = filterKeyBuilder('key');

const filterKey = filter => {
  if (Object.values(KEY_CODE).indexOf(filter) !== -1) {
    return filterKeyByWhich(filter);
  }
  return filterKeyByKey(filter);
};

/**
 * Emit keyup for a key code
 */
export const keyup = filter =>
  Observable.fromEvent(window, 'keyup').filter(filterKey(filter));

/**
 * Emit keydown for a key code
 */
export const keydown = filter =>
  Observable.fromEvent(window, 'keydown').filter(filterKey(filter));

/**
 * Emit when near (1000px) page bottom
 * defaults to window but also works with any dom node
 */
export const nearPageBottom = (node = window) =>
  Observable.fromEvent(node, 'scroll')
    // look at the latest scroll every 250 ms
    .observeOn(Scheduler.animationFrame)
    .map(
      // get all the stuff from the dom in one place to avoid redundant reflows
      _ => [
        node.scrollY || node.scrollTop,
        node.scrollHeight || document.body.scrollHeight,
        window.innerHeight,
      ]
    )
    .scan(
      // create pairs with previous and current value (in that order)
      (acc, el) => [acc[1], el],
      [null, [0, 0, 0]]
    )
    .filter(
      // emit only when scrolling down
      ([[scrollA], [scrollB]]) => scrollB > scrollA
    )
    .filter(
      // emit only when last scroll event is close to bottom
      ([_, [scroll, page, viewPort]]) => page - scroll - viewPort < 1000
    );

export const nearPageBottom$ = nearPageBottom(window);

const mouseToXY = ({ clientX, clientY }) => ({ x: clientX, y: clientY });

const stopPropagationIf = b => e => {
  if (b) {
    e.stopPropagation();
  }
};

const stopPropagationIf$ = bool => obs => obs.do(stopPropagationIf(bool));

export const mouseMove$ = ({ element, stopPropagation }) =>
  stopPropagationIf$(stopPropagation)(
    Observable.fromEvent(element, 'mousemove')
  ).map(mouseToXY);
export const mouseDown$ = ({ element, stopPropagation }) =>
  stopPropagationIf$(stopPropagation)(
    Observable.fromEvent(element, 'mousedown')
  ).map(mouseToXY);
export const mouseUp$ = ({ element, stopPropagation }) =>
  stopPropagationIf$(stopPropagation)(Observable.fromEvent(element, 'mouseup'));

const distance = ({ x, y }, b) => ((b.x - x) ** 2 + (b.y - y) ** 2) ** 0.5;

export const rangeSelector$ = ({ sensibility, ...props }) => {
  const obs = mouseDown$(props)
    .switchMap(origPos =>
      mouseMove$(props)
        .map(curPos => ({ origPos, curPos }))
        .filter(pos => distance(...Object.values(pos)) > sensibility)
        .takeUntil(mouseUp$(props))
    )
    .share();
  return obs.takeUntil(obs.flatMap(_ => mouseUp$(props)));
};

export const mouseMoveWhenClicked$ = ({ moveOnWindow, ...props }) => {
  const overwriteProps = {
    ...props,
    ...(moveOnWindow ? { element: window } : {}),
  };
  return mouseDown$(props)
    .take(1)
    .switchMap(_ =>
      mouseMove$(overwriteProps).takeUntil(mouseUp$(overwriteProps))
    );
};

const copyDomObject = o => {
  const newObj = {};
  // DOM objects are not compatible with all the objects functions,
  // so no other choice than a for in loop
  // eslint-disable-next-line
  for (let k in o) {
    newObj[k] = o[k];
  }
  return newObj;
};

const mapWindowYToY = ({ y, height, top }) =>
  Math.max(0, Math.min(y - top, height));
const mapWindowXToX = ({ x, width, left }) =>
  Math.max(0, Math.min(x - left, width));
const mapWindowXYToXY = ({ x, y, width, left, height, top }) => ({
  x: mapWindowXToX({ x, width, left }),
  y: mapWindowYToY({ y, height, top }),
});
export const mapWindowXYToElementXY = ({ x, y, element }) =>
  mapWindowXYToXY({ ...copyDomObject(element.getBoundingClientRect()), x, y });
