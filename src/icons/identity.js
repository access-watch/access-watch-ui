// TODO: can we make eslint check these requires?
/*eslint-disable*/
// These are raw svg as a string. This is usually what we want to use because we
// can then pass the string to the SVGIcon component which will render the svg
// tag, which we can put custom styles on them. However! In stylesheets, url()
// values are transformed to require() statements by css-loader and if raw
// string was default output for svg, it would messup up out url() values.
import ROBOT_SVG from '!raw-loader!../../assets/okay.svg';
import SUSPICIOUS_ROBOT_SVG from '!raw-loader!../../assets/suspicious.svg';
import BAD_ROBOT_SVG from '!raw-loader!../../assets/dangerous.svg';
import HUMAN_SVG from '!raw-loader!../../assets/user-boy.svg';
import UNKNOWN_SVG from '!raw-loader!../../assets/unknown-robot.svg';
/* eslint-enable */

const niceBrowserIcon = HUMAN_SVG;
const badBrowserIcon = SUSPICIOUS_ROBOT_SVG;
const unknownIcon = UNKNOWN_SVG;

// maps identity and reputation to an svg icon with a class to set its fill
export const identityIcons = {
  robot: {
    nice: ROBOT_SVG,
    ok: ROBOT_SVG,
    suspicious: SUSPICIOUS_ROBOT_SVG,
    bad: BAD_ROBOT_SVG,
  },
  browser: {
    nice: niceBrowserIcon,
    ok: niceBrowserIcon,
    suspicious: badBrowserIcon,
    bad: badBrowserIcon,
  },
  unknown: {
    nice: unknownIcon,
    ok: unknownIcon,
    suspicious: unknownIcon,
    bad: unknownIcon,
  },
};

export default identityIcons;
