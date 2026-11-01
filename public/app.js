(() => {
  const el = (id) => document.getElementById(id);
  const axes = ["x1", "y1", "x2", "y2"];
  const values = [...CurveCourier.presets.express];
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animation;

  function reset() {
    animation?.cancel();
    animation = undefined;
    el("runner").style.removeProperty("transform");
    el("motion-status").textContent = "";
  }

  function update() {
    reset();
    el("copy-status").textContent = "";
    el("preset").value = CurveCourier.match(values);
    el("curve").setAttribute("d", CurveCourier.path(values));
    el("css").textContent =
      "transition-timing-function: " + CurveCourier.easing(values) + ";";
    axes.forEach((name, index) => {
      el(name).value = values[index];
      el("value-" + name).value = values[index].toFixed(2);
    });
    for (const [number, offset] of [
      [1, 0],
      [2, 2],
    ]) {
      const [x, y] = CurveCourier.plot(values[offset], values[offset + 1]);
      el("arm" + number).setAttribute("x2", x);
      el("arm" + number).setAttribute("y2", y);
      el("dot" + number).setAttribute("cx", x);
      el("dot" + number).setAttribute("cy", y);
    }
  }

  axes.forEach((name, index) => {
    const wrap = document.createElement("div");
    const label = document.createElement("label");
    label.htmlFor = name;
    label.textContent = name.toUpperCase();
    const value = document.createElement("output");
    value.id = "value-" + name;
    value.setAttribute("for", name);
    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = name;
    slider.step = "0.01";
    slider.min = index % 2 ? "-0.5" : "0";
    slider.max = index % 2 ? "1.5" : "1";
    slider.addEventListener("input", () => {
      values[index] = Number(slider.value);
      update();
    });
    wrap.append(label, value, slider);
    el("sliders").append(wrap);
  });

  el("preset").addEventListener("change", (event) => {
    values.splice(0, 4, ...CurveCourier.presets[event.target.value]);
    update();
  });

  el("play").addEventListener("click", () => {
    reset();
    const runner = el("runner");
    const distance = runner.parentElement.clientWidth - runner.offsetWidth;
    const end = "translateX(" + distance + "px)";
    runner.style.transform = end;
    if (motion.matches) {
      el("motion-status").textContent =
        "End position shown with reduced motion.";
      return;
    }
    animation = runner.animate(
      [{ transform: "translateX(0)" }, { transform: end }],
      {
        duration: 900,
        easing: CurveCourier.easing(values),
      },
    );
    el("motion-status").textContent = "Playing.";
    animation.onfinish = () => {
      el("motion-status").textContent = "Motion complete.";
    };
  });

  el("copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(el("css").textContent);
      el("copy-status").textContent = "CSS copied.";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(el("css"));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      el("copy-status").textContent =
        "CSS selected. Use your device’s Copy command.";
    }
  });

  window.addEventListener("resize", reset);
  motion.addEventListener("change", reset);
  update();
})();
