(function () {
  const LOCALES = ["en","vi","fr"];

  function switchTo(to) {
    if (location.protocol === "file:") {
      const name = (location.pathname.split("/").pop() || "index.html");
      location.href = "../" + to + "/" + name;
      localStorage.setItem("site_lang", to);
      return;
    }
    const parts = location.pathname.split("/").filter(Boolean);
    const i = parts.findIndex(seg => LOCALES.includes(seg));
    if (i >= 0) parts[i] = to;
    else { const insertAt = parts.length ? 1 : 0; parts.splice(insertAt, 0, to); }
    localStorage.setItem("site_lang", to);
    location.pathname = "/" + parts.join("/");
  }

  // --- Floating dropdown (portal to body) with HOVER open ---
  (function(){
    const switcher = document.querySelector('.lang-switcher');
    if (!switcher) return;
    const trigger = switcher.querySelector('.lang-trigger');
    const menu = switcher.querySelector('.lang-menu');
    const placeholder = document.createComment('lang-menu-placeholder');
    let open = false, hideTimer = null;

    function positionMenu(){
      const r = trigger.getBoundingClientRect();
      const w = menu.offsetWidth || 120;
      const left = Math.min(r.right - w, window.innerWidth - w - 12);
      const top = r.bottom + 8;
      menu.style.left = Math.max(12, left) + "px";
      menu.style.top  = top + "px";
    }
    function openMenu(){
      if (open) return; open = true;
      switcher.appendChild(placeholder);
      menu.classList.add('is-floating');
      document.body.appendChild(menu);
      positionMenu();
      window.addEventListener('scroll', positionMenu, {passive:true});
      window.addEventListener('resize', positionMenu);
    }
    function closeMenu(){
      if (!open) return; open = false;
      menu.classList.remove('is-floating');
      placeholder.replaceWith(menu);
      window.removeEventListener('scroll', positionMenu);
      window.removeEventListener('resize', positionMenu);
    }
    function cancelHide(){ if(hideTimer){ clearTimeout(hideTimer); hideTimer=null; } }

    // Hover logic: open on enter, close shortly after leaving both trigger and menu
    trigger.addEventListener('mouseenter', () => { cancelHide(); openMenu(); });
    trigger.addEventListener('mouseleave', () => { hideTimer = setTimeout(closeMenu, 120); });
    menu.addEventListener('mouseenter', cancelHide);
    menu.addEventListener('mouseleave', () => { hideTimer = setTimeout(closeMenu, 120); });

    // Also close on click outside or Escape
    document.addEventListener('click', (e)=>{
      if (!open) return;
      if (e.target.closest('.lang-menu') || e.target.closest('.lang-trigger')) return;
      closeMenu();
    }, true);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeMenu(); });
  })();

  // --- Language selection ---
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-locale]");
    if (!a) return;
    e.preventDefault();
    switchTo(a.getAttribute("data-locale"));
  }, { passive: true });

  // Hide topbar on wheel/scroll
  (function(){
    const header = document.querySelector('.site-header');
    const SHOW_AT = 40;
    let cooldown = false, lastY = window.scrollY;

    window.addEventListener('wheel', (e) => {
      if (cooldown) return;
      if (e.deltaY > 0) header.classList.add('hide-topbar');
      else if (e.deltaY < 0) header.classList.remove('hide-topbar');
      cooldown = true; setTimeout(() => cooldown = false, 120);
    }, { passive: true });

    window.addEventListener('scroll', () => {
      const y = window.scrollY, dy = y - lastY;
      if (dy > 0) header.classList.add('hide-topbar');
      else if (dy < 0) header.classList.remove('hide-topbar');
      if (y < SHOW_AT) header.classList.remove('hide-topbar');
      lastY = y;
    }, { passive: true });
  })();
})();
