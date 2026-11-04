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

  function parseCSS(raw) {
    if (typeof raw !== "string" || raw.length > 512) {
      throw new Error(
        "Paste a single cubic-bezier() value or timing-function declaration.",
      );
    }
    const parts = raw
      .trim()
      .match(
        /^(?:(?:transition|animation)-timing-function\s*:\s*)?cubic-bezier\(\s*([^()]*)\s*\)\s*;?$/i,
      );
    if (!parts)
      throw new Error(
        "Paste a single cubic-bezier() value or timing-function declaration.",
      );
    const tokens = parts[1].split(",").map((token) => token.trim());
    const cssNumber = /^[+-]?(?:\d*\.\d+|\d+)(?:e[+-]?\d+)?$/i;
    if (
      tokens.length !== 4 ||
      !tokens.every((token) => cssNumber.test(token))
    ) {
      throw new Error("Include four numeric coordinates separated by commas.");
    }
    const coords = tokens.map(Number);
    if (!valid(coords))
      throw new Error("X coordinates must fall between 0 and 1.");
    if (
      coords[1] < -0.5 ||
      coords[1] > 1.5 ||
      coords[3] < -0.5 ||
      coords[3] > 1.5
    ) {
      throw new Error("This canvas supports Y coordinates from −0.5 to 1.5.");
    }
    return coords;
  }

  function plot(x, y) {
    return [28 + 240 * x, 140 - 76 * y];
  }

  function coordinatePair(x, y) {
    const quantize = (value, low, high) =>
      Number(Math.min(high, Math.max(low, value)).toFixed(3));
    return [quantize(x, 0, 1), quantize(y, -0.5, 1.5)];
  }

  function unplot(x, y) {
    return coordinatePair((x - 28) / 240, (140 - y) / 76);
  }

  function nudge(x, y, key, amount) {
    const shifts = {
      ArrowUp: [0, amount],
      ArrowDown: [0, -amount],
      ArrowLeft: [-amount, 0],
      ArrowRight: [amount, 0],
    };
    return coordinatePair(x + shifts[key][0], y + shifts[key][1]);
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

  return { presets, valid, easing, parseCSS, plot, unplot, nudge, path, match };
})();

if (typeof module !== "undefined") module.exports = CurveCourier;
