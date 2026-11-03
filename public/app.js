(() => {
  const el = (id) => document.getElementById(id);
  const axes = ["x1", "y1", "x2", "y2"];
  const values = [...CurveCourier.presets.express];
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animations = [];
  let reference;

  function reset() {
    for (const animation of animations) animation.cancel();
    animations = [];
    el("reference-runner").style.removeProperty("transform");
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
      const exact = values[index];
      const hundredth = Number(exact.toFixed(2)) === exact;
      el(name).step = hundredth ? "0.01" : "any";
      el(name).value = exact;
      el("value-" + name).value = hundredth ? exact.toFixed(2) : String(exact);
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

  function updateReference() {
    reset();
    el("reference-curve").toggleAttribute("hidden", !reference);
    el("reference-lane").hidden = !reference;
    el("clear-reference").hidden = !reference;
    if (reference) {
      el("reference-curve").setAttribute("d", CurveCourier.path(reference));
      el("pin-status").textContent =
        "Dashed reference: " + CurveCourier.easing(reference);
    } else {
      el("reference-curve").removeAttribute("d");
      el("pin-status").textContent = "Reference cleared.";
    }
  }

  el("pin-reference").addEventListener("click", () => {
    reference = [...values];
    updateReference();
  });
  el("clear-reference").addEventListener("click", () => {
    reference = undefined;
    updateReference();
    el("pin-reference").focus();
  });
  el("import-form").addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      const imported = CurveCourier.parseCSS(el("css-import").value);
      values.splice(0, 4, ...imported);
      update();
      el("css-import").removeAttribute("aria-invalid");
      el("css-import-status").textContent = "Curve applied.";
    } catch (error) {
      el("css-import").setAttribute("aria-invalid", "true");
      el("css-import-status").textContent = error.message;
    }
  });
  el("css-import").addEventListener("input", () => {
    el("css-import").removeAttribute("aria-invalid");
    el("css-import-status").textContent = "";
  });

  el("play").addEventListener("click", () => {
    reset();
    const lanes = [[el("runner"), values]];
    if (reference) lanes.push([el("reference-runner"), reference]);
    const start = document.timeline.currentTime;
    for (const [runner, curve] of lanes) {
      const distance = runner.parentElement.clientWidth - runner.offsetWidth;
      const end = "translateX(" + distance + "px)";
      runner.style.transform = end;
      if (!motion.matches) {
        const animation = runner.animate(
          [{ transform: "translateX(0)" }, { transform: end }],
          { duration: 900, easing: CurveCourier.easing(curve) },
        );
        if (start !== null) animation.startTime = start;
        animations.push(animation);
      }
    }
    if (motion.matches) {
      el("motion-status").textContent =
        "End position shown with reduced motion.";
      return;
    }
    el("motion-status").textContent = "Playing.";
    animations[0].onfinish = () => {
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
