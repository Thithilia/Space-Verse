(function () {
  const overlay = document.querySelector(".home-overlay");
  const triggers = document.querySelectorAll("[data-overlay-trigger]");

  if (!overlay || !triggers.length) return;
  let activeTrigger = null;

  function activate(trigger) {
    const visual = trigger.querySelector(".home-circle-item__visual") || trigger;
    const rect = visual.getBoundingClientRect();
    const image = trigger.dataset.overlayImage;
    const color = trigger.dataset.overlayColor || "#0f2748";

    if (activeTrigger && activeTrigger !== trigger) {
      activeTrigger.classList.remove("is-overlay-source");
    }

    activeTrigger = trigger;
    activeTrigger.classList.add("is-overlay-source");

    overlay.style.setProperty("--overlay-x", rect.left + rect.width / 2 + "px");
    overlay.style.setProperty("--overlay-y", rect.top + rect.height / 2 + "px");
    overlay.style.setProperty("--overlay-color", color);
    overlay.style.setProperty("--overlay-image", image ? `url("${image}")` : "none");

    overlay.classList.add("is-active");
  }

  function deactivate() {
    overlay.classList.remove("is-active");
    if (activeTrigger) {
      activeTrigger.classList.remove("is-overlay-source");
      activeTrigger = null;
    }
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("mouseenter", function () {
      activate(trigger);
    });

    trigger.addEventListener("mouseleave", function () {
      deactivate();
    });

    trigger.addEventListener("focus", function () {
      activate(trigger);
    });

    trigger.addEventListener("blur", deactivate);
  });

  window.addEventListener(
    "scroll",
    function () {
      if (!overlay.classList.contains("is-active")) return;
      deactivate();
    },
    { passive: true }
  );
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") deactivate();
  });
})();
