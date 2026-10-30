const CurveCourier = (() => {
  const presets = {
    express: [0.22, 1, 0.36, 1],
    linear: [0, 0, 1, 1],
    accelerate: [0.42, 0, 1, 1],
    decelerate: [0, 0, 0.58, 1],
    overshoot: [0.34, 1.5, 0.64, 1],
  };

  function valid(values) {
    return (
      Array.isArray(values) &&
      values.length === 4 &&
      values.every(
        (value, index) =>
          Number.isFinite(value) &&
          (index % 2 === 1 || (value >= 0 && value <= 1)),
      )
    );
  }

  function easing(values) {
    if (!valid(values))
      throw new RangeError(
        "Use four finite coordinates and keep x between 0 and 1.",
      );
    return "cubic-bezier(" + values.join(", ") + ")";
  }

  function plot(x, y) {
    return [28 + 240 * x, 140 - 76 * y];
  }

  function path(values) {
    if (!valid(values)) throw new RangeError("Invalid curve");
    const pair = (x, y) =>
      plot(x, y)
        .map((value) => Number(value.toFixed(2)))
        .join(" ");
    return (
      "M" +
      pair(0, 0) +
      " C" +
      pair(values[0], values[1]) +
      " " +
      pair(values[2], values[3]) +
      " " +
      pair(1, 1)
    );
  }

  function match(values) {
    return (
      Object.keys(presets).find((name) =>
        presets[name].every((value, index) => value === values[index]),
      ) || "custom"
    );
  }

  return { presets, valid, easing, plot, path, match };
})();

if (typeof module !== "undefined") module.exports = CurveCourier;
