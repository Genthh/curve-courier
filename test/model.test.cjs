const test = require("node:test");
const assert = require("node:assert/strict");
const {
  presets,
  valid,
  easing,
  path,
  plot,
  match,
} = require("../public/model.js");

test("presets export valid CSS and identify custom curves", () => {
  for (const [name, values] of Object.entries(presets)) {
    assert.equal(match(values), name);
    assert.equal(valid(values), true);
  }
  assert.equal(easing(presets.express), "cubic-bezier(0.22, 1, 0.36, 1)");
  assert.equal(match([0.1, -0.5, 0.9, 1.4]), "custom");
});

test("out-of-range horizontal controls fail but vertical overshoot is permitted", () => {
  assert.throws(() => easing([-0.01, 0, 1, 1]), RangeError);
  assert.throws(() => easing([0, 0, 1.01, 1]), RangeError);
  assert.throws(() => path([0, NaN, 1, 1]), RangeError);
  assert.equal(valid([0, -0.5, 1, 1.5]), true);
});

test("the plot anchors stay fixed as control points change", () => {
  assert.deepEqual(plot(0, 0), [28, 140]);
  assert.deepEqual(plot(1, 1), [268, 64]);
  assert.equal(path(presets.linear), "M28 140 C28 140 268 64 268 64");
});

test("CSS import accepts values and declarations while retaining numeric precision", () => {
  const { parseCSS } = require("../public/model.js");
  assert.deepEqual(
    parseCSS(
      " animation-timing-function: cubic-bezier(.125, -0.1, 5e-1, 1.25); ",
    ),
    [0.125, -0.1, 0.5, 1.25],
  );
  assert.deepEqual(parseCSS(easing(presets.express)), presets.express);
});

test("CSS import rejects invalid, compound and out-of-canvas inputs", () => {
  const { parseCSS } = require("../public/model.js");
  for (const value of [
    "linear",
    "cubic-bezier(0, , 1, 1)",
    "cubic-bezier(0, 0, 2, 1)",
    "cubic-bezier(0, 2, 1, 1)",
    "cubic-bezier(0, 0, 1, 1);color:red",
    "cubic-bezier(0x1, 0, 1, 1)",
  ]) {
    assert.throws(() => parseCSS(value));
  }
});

test("dragging maps graph coordinates back to precise clamped control values", () => {
  const { unplot } = require("../public/model.js");
  for (const pair of [
    [0, 0],
    [1, 1],
    [0.123, 1.333],
    [0.905, -0.235],
  ]) {
    assert.deepEqual(unplot(...plot(...pair)), pair);
  }
  assert.deepEqual(unplot(-100, -1000), [0, 1.5]);
  assert.deepEqual(unplot(700, 800), [1, -0.5]);
  assert.deepEqual(unplot(...plot(0.12381, -0.30267)), [0.124, -0.303]);
});
test("arrow-key nudges respect the same canvas bounds and precision", () => {
  const { nudge } = require("../public/model.js");
  assert.deepEqual(nudge(0.85, 1.49, "ArrowUp", 0.1), [0.85, 1.5]);
  assert.deepEqual(nudge(0, 0, "ArrowLeft", 0.01), [0, 0]);
  assert.deepEqual(nudge(0.123, 0.4, "ArrowRight", 0.001), [0.124, 0.4]);
  assert.deepEqual(nudge(1, -0.495, "ArrowDown", 0.01), [1, -0.5]);
});
