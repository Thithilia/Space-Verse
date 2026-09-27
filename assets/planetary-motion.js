/* GSAP rotates the orbit and counter-rotates its planet to keep text upright. */
(function () {
  "use strict";

  const section = document.querySelector(".home-planetary");
  const gsap = window.gsap;
  if (!section || !gsap) return;

  const system = section.querySelector(".home-research__stack");
  const toggle = section.querySelector(".planetary-motion-toggle");
  const orbits = Array.from(system.querySelectorAll(".planetary-orbit"));
  const planets = orbits.map((orbit) => orbit.querySelector(".home-circle-item"));
  // Circular orbits around the same central mass: T = 2*pi*sqrt(r^3 / GM).
  // Relative diameters have the same ratios as radii, at every viewport size.
  const diameters = orbits.map((orbit) => parseFloat(orbit.style.getPropertyValue("--orbit")));
  const referenceDiameter = Math.min(...diameters);
  const referencePeriod = 40; // Display seconds for one revolution on the innermost orbit.
  const periods = diameters.map((diameter) => referencePeriod * (diameter / referenceDiameter) ** 1.5);
  const legend = document.createElement("ol");
  legend.className = "planetary-legend";
  legend.hidden = true;
  planets.forEach(function (planet, index) {
    planet.dataset.planetIndex = String(index + 1);
    const entry = document.createElement("li");
    const link = document.createElement(planet.tagName.toLowerCase());
    if (planet.tagName === "A") link.href = planet.getAttribute("href");
    else {
      link.type = "button";
      link.addEventListener("click", function () { planet.click(); });
    }
    const number = document.createElement("span");
    number.className = "planetary-legend__number";
    number.textContent = String(index + 1);
    number.setAttribute("aria-hidden", "true");
    const image = planet.querySelector("img").cloneNode(false);
    image.alt = "";
    image.width = 32;
    image.height = 32;
    const name = document.createElement("span");
    name.textContent = planet.querySelector(".home-circle-item__title").textContent;
    link.append(number, image, name);
    entry.append(link);
    legend.append(entry);
  });
  system.after(legend);
  let userPaused = false;
  const media = gsap.matchMedia();

  media.add("(prefers-reduced-motion: no-preference)", function () {
    const listeners = new AbortController();
    const options = { signal: listeners.signal };
    let inView = false;
    let hovered = null;

    // Explicit percentages keep both centers correct when the viewport resizes.
    gsap.set([...orbits, ...planets], {
      x: 0, y: 0, xPercent: -50, yPercent: -50, transformOrigin: "50% 50%"
    });

    // Each planet shares a clock with its counter-rotation, not with other orbits.
    const motions = orbits.map((orbit, index) => gsap.to([orbit, planets[index]], {
      rotation: (targetIndex) => targetIndex === 0 ? 360 : -360,
      duration: periods[index],
      repeat: -1,
      ease: "none",
      paused: true
    }));

    function updatePlayback() {
      const focused = system.contains(document.activeElement);
      const paused = userPaused || hovered !== null || focused || !inView || document.hidden;
      motions.forEach((motion) => motion.paused(paused));
      toggle.setAttribute("aria-pressed", String(userPaused));
      toggle.textContent = userPaused ? "Tiếp tục chuyển động" : "Tạm dừng chuyển động";
    }

    toggle.hidden = false;
    legend.hidden = false;
    section.dataset.motionEnabled = "true";

    toggle.addEventListener("click", function () {
      userPaused = !userPaused;
      updatePlayback();
    }, options);

    planets.forEach(function (planet) {
      planet.addEventListener("pointerenter", function (event) {
        if (event.pointerType === "touch") return;
        hovered = planet;
        updatePlayback();
      }, options);
      planet.addEventListener("pointerleave", function () {
        if (hovered === planet) hovered = null;
        updatePlayback();
      }, options);
    });

    system.addEventListener("focusin", updatePlayback, options);
    system.addEventListener("focusout", function () {
      // Wait until focus has moved before deciding whether to resume.
      queueMicrotask(function () {
        if (!listeners.signal.aborted) updatePlayback();
      });
    }, options);
    document.addEventListener("visibilitychange", updatePlayback, options);

    const observer = new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      updatePlayback();
    });
    observer.observe(system);
    updatePlayback();

    return function () {
      listeners.abort();
      observer.disconnect();
      toggle.hidden = true;
      legend.hidden = true;
      delete section.dataset.motionEnabled;
    };
  });
})();
