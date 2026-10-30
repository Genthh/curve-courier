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
