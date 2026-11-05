// Decides when pulling the hanging tag should switch the theme, like a lamp cord.
// Pull down far enough and the switch is "armed"; letting go while armed switches. Anything else is just playing with the chain.
// All lengths are in screen pixels, so a small tag on a phone needs the same deliberate pull as a large one on a desktop.

export const PULL = {
  ratio: 1.55,      // armed at this many times the chain's resting length…
  extra: 56,        // …or this many pixels longer, whichever is further
  disarmGap: 14,    // pixels back before it disarms, so it can't flicker at the boundary
  armAngle: 60,     // degrees either side of straight down
  disarmAngle: 72,
  holdMs: 120,      // must stay armed this long, which rules out quick flings
  cooldownMs: 700,  // pause after a switch
  reachRatio: 2.4,  // how far the chain can stretch at most…
  reachExtra: 96,   // …or this many pixels longer, whichever is further
};

export const armDistance = rest => Math.max(rest * PULL.ratio, rest + PULL.extra);
export const maxReach = rest => Math.max(rest * PULL.reachRatio, rest + PULL.reachExtra);
const angleFromDown = (dx, dy) => Math.abs(Math.atan2(dx, dy)) * 180 / Math.PI;

export function createPullSwitch(now = () => Date.now()) {
  let armedAt = null, lastSwitch = -Infinity;
  const switchObject = {
    isArmed: () => armedAt !== null,
    // dx, dy: from the ring to the tag's hole. rest: the chain's resting length. Returns whether it is armed.
    move(dx, dy, rest) {
      const distance = Math.hypot(dx, dy), angle = angleFromDown(dx, dy), at = armDistance(rest);
      if (armedAt === null) {
        if (now() - lastSwitch >= PULL.cooldownMs && distance >= at && angle <= PULL.armAngle) armedAt = now();
      } else if (distance < at - PULL.disarmGap || angle > PULL.disarmAngle) {
        armedAt = null;
      }
      return armedAt !== null;
    },
    // Letting go. Returns true when this release should switch the theme.
    release() {
      const fire = armedAt !== null && now() - armedAt >= PULL.holdMs;
      armedAt = null;
      if (fire) lastSwitch = now();
      return fire;
    },
    cancel() { armedAt = null; },
  };
  return switchObject;
}
