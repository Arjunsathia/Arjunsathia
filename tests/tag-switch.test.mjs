import test from 'node:test';
import assert from 'node:assert/strict';
import {createPullSwitch, armDistance, maxReach, PULL} from '../src/lib/tag-switch.js';

const clock = () => { let t = 1000; const now = () => t; now.tick = ms => { t += ms; }; return now; };
const REST = 54; // a large screen's chain, in pixels
const PHONE = 27;

test('the pull needed is a real distance, even on a small phone chain', () => {
  assert.equal(armDistance(PHONE), PHONE + PULL.extra);
  assert.equal(armDistance(200), 200 * PULL.ratio);
  assert.ok(maxReach(PHONE) > armDistance(PHONE), 'a phone can pull past the threshold');
  assert.ok(maxReach(REST) > armDistance(REST), 'a large screen can pull past the threshold');
});

test('a deliberate pull down and release switches', () => {
  const now = clock(), pull = createPullSwitch(now);
  assert.equal(pull.move(0, armDistance(REST) + 5, REST), true);
  now.tick(PULL.holdMs + 1);
  assert.equal(pull.release(), true);
});

test('a small tug never arms', () => {
  const now = clock(), pull = createPullSwitch(now);
  assert.equal(pull.move(0, armDistance(REST) - 1, REST), false);
  now.tick(500);
  assert.equal(pull.release(), false);
});

test('a sideways drag never arms, however far', () => {
  const now = clock(), pull = createPullSwitch(now);
  assert.equal(pull.move(300, 10, REST), false);
  assert.equal(pull.move(300, 150, REST), false); // 63° from straight down
  now.tick(500);
  assert.equal(pull.release(), false);
});

test('a pull upward never arms', () => {
  const pull = createPullSwitch(clock());
  assert.equal(pull.move(0, -300, REST), false);
});

test('a quick fling does not switch', () => {
  const now = clock(), pull = createPullSwitch(now);
  pull.move(0, armDistance(REST) + 40, REST);
  now.tick(PULL.holdMs - 1);
  assert.equal(pull.release(), false);
});

test('moving back up disarms, which is how to change your mind', () => {
  const now = clock(), pull = createPullSwitch(now), at = armDistance(REST);
  assert.equal(pull.move(0, at + 5, REST), true);
  now.tick(300);
  assert.equal(pull.move(0, at - PULL.disarmGap - 1, REST), false);
  assert.equal(pull.release(), false);
});

test('the gap stops it flickering at the boundary', () => {
  const pull = createPullSwitch(clock()), at = armDistance(REST);
  assert.equal(pull.move(0, at, REST), true);
  assert.equal(pull.move(0, at - PULL.disarmGap + 1, REST), true);
  assert.equal(pull.move(0, at, REST), true);
});

test('cancelling (an interrupted touch or Esc) never switches', () => {
  const now = clock(), pull = createPullSwitch(now);
  pull.move(0, armDistance(REST) + 5, REST);
  now.tick(500);
  pull.cancel();
  assert.equal(pull.isArmed(), false);
  assert.equal(pull.release(), false);
});

test('there is a pause after a switch', () => {
  const now = clock(), pull = createPullSwitch(now), far = armDistance(REST) + 5;
  pull.move(0, far, REST);
  now.tick(PULL.holdMs);
  assert.equal(pull.release(), true);
  now.tick(PULL.cooldownMs - 1);
  assert.equal(pull.move(0, far, REST), false);
  now.tick(1);
  assert.equal(pull.move(0, far, REST), true);
});

test('release without any movement (a tap) never switches', () => {
  assert.equal(createPullSwitch(clock()).release(), false);
});
