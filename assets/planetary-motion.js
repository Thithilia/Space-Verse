/* GSAP rotates the orbit and counter-rotates its planet to keep text upright. */
(function () {
  "use strict";

  const section = document.querySelector(".home-planetary");
  const gsap = window.gsap;
  if (!section || !gsap) return;

  const system = section.querySelector(".home-research__stack");
  const orbits = Array.from(system.querySelectorAll(".planetary-orbit"));
  const planets = orbits.map((orbit) => orbit.querySelector(".home-circle-item"));
  // Circular orbits around the same central mass: T = 2*pi*sqrt(r^3 / GM).
  // Relative diameters have the same ratios as radii, at every viewport size.
  const diameters = orbits.map((orbit) => parseFloat(orbit.style.getPropertyValue("--orbit")));
  const referenceDiameter = Math.min(...diameters);
  const referencePeriod = 40; // Display seconds for one revolution on the innermost orbit.
  const periods = diameters.map((diameter) => referencePeriod * (diameter / referenceDiameter) ** 1.5);
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
      const paused = hovered !== null || focused || !inView || document.hidden;
      motions.forEach((motion) => motion.paused(paused));
    }

    section.dataset.motionEnabled = "true";

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
      delete section.dataset.motionEnabled;
    };
  });
})();
