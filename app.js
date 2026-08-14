/* =================================================================
   Margot Schuijff — scrollytelling engine
   Mirrors the bakkerij scroll site: one sticky stage with crossfading
   chapters. The video layer is replaced by color washes, so there is
   no scrubbing, just clean opacity crossfades driven by scroll.
   ================================================================= */
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- central rAF loop + Lenis smooth scroll ---- */
  const subscribers = new Set();
  let lenis = null;

  if (!reduced && window.Lenis) {
    lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.3,
      lerp: 0.18,
    });
  }

  /* ---- in-page anchor routing ----
     Captions live position:absolute inside a sticky pin, so a normal
     anchor jump lands nowhere. For those we compute the scrollY that
     makes the caption active and centered in its scroll slice. */
  const scrollToHash = (id) => {
    const t = document.getElementById(id);
    if (!t) return;

    const cap = t.closest(".cap");
    const stage = document.querySelector("[data-stage]");
    if (cap && stage && !stage.classList.contains("stage--static")) {
      const track = stage.querySelector(".stage__track");
      const caps = stage.querySelectorAll(".cap");
      const idx = Array.from(caps).indexOf(cap);
      const total = track.offsetHeight - window.innerHeight;
      const trackTop = track.getBoundingClientRect().top + window.scrollY;
      const target = trackTop + total * ((idx + 0.5) / caps.length);
      if (lenis) lenis.scrollTo(target, { duration: 1.3 });
      else window.scrollTo({ top: target, behavior: "smooth" });
      return;
    }
    if (lenis) lenis.scrollTo(t, { duration: 1.3 });
    else t.scrollIntoView({ behavior: "smooth" });
  };

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      if (!id) return;
      if (!document.getElementById(id)) return;
      e.preventDefault();
      scrollToHash(id);
    });
  });

  const tick = (time) => {
    if (lenis) lenis.raf(time);
    subscribers.forEach((fn) => fn(time));
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  /* ---- top scroll-progress bar ---- */
  const spBar = document.querySelector(".scroll-progress span");
  if (spBar) {
    const updateSP = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      spBar.style.setProperty("--sp", `${(Math.min(1, Math.max(0, p)) * 100).toFixed(2)}%`);
    };
    subscribers.add(updateSP);
    updateSP();
  }

  /* ---- entrance reveals ---- */
  const revealEls = document.querySelectorAll("[data-reveal], [data-stagger]");
  if (reduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---- dock theme: flip text colour over dark sections ---- */
  const dock = document.querySelector(".dock");
  if (dock) {
    const dockEls = Array.from(document.querySelectorAll("[data-dock]"));
    const probeY = 36;
    const checkDock = () => {
      let tone = "light";
      let veil = 0;
      for (const el of dockEls) {
        const r = el.getBoundingClientRect();
        if (r.top <= probeY && r.bottom >= probeY) {
          tone = el.dataset.dock || "light";
          break;
        }
      }
      dock.classList.toggle("dock--dark", tone === "dark");
      // subtle paper veil once the hero has scrolled away
      veil = window.scrollY > 80 && tone === "light" ? 1 : 0;
      dock.style.setProperty("--dock-veil", veil);
    };
    subscribers.add(checkDock);
    checkDock();
  }

  /* ---- the stage ---- */
  const stage = document.querySelector("[data-stage]");
  if (stage) {
    const track = stage.querySelector(".stage__track");
    const washes = Array.from(stage.querySelectorAll(".wash"));
    const caps = Array.from(stage.querySelectorAll(".cap"));
    const progress = stage.querySelector(".stage__progress span");
    const counter = document.getElementById("capnum");
    const N = caps.length;
    const isNarrow = window.matchMedia("(max-width: 700px)").matches;

    /* De gedeelde media-laag: één beeld per hoofdstuk, allemaal op
       dezelfde plek. Alleen de opacity wisselt, zodat de fles tijdens
       de crossfade exact blijft staan. */
    const shots = Array.from(stage.querySelectorAll(".shot"));
    const shotSrc = (el) => {
      const m = el && el.querySelector("img, video source, video");
      return m ? m.getAttribute("src") || m.getAttribute("poster") : null;
    };

    if (reduced || isNarrow) {
      /* static fallback: unpin, every chapter visible and stacked.
         Used for reduced-motion and for small viewports, where a
         pinned crossfade does not suit the longer panels. Elk
         hoofdstuk krijgt zijn eigen beeld als achtergrond. */
      stage.classList.add("stage--static");
      caps.forEach((c, i) => {
        c.classList.add("is-active");
        const src = shotSrc(shots[i]);
        if (src) c.style.setProperty("--shot", `url("${src}")`);
      });
    } else if (N) {
      let activeIdx = -1;

      const update = () => {
        const r = track.getBoundingClientRect();
        const total = track.offsetHeight - window.innerHeight;
        const raw = total > 0 ? -r.top / total : 0;
        const p = Math.max(0, Math.min(0.99999, raw));

        const slice = 1 / N;
        const idx = Math.min(N - 1, Math.floor(p / slice));
        const local = (p - idx * slice) / slice; // 0..1 within the chapter

        if (idx !== activeIdx) {
          washes.forEach((w, i) => w.classList.toggle("is-active", i === idx));
          shots.forEach((s, i) => s.classList.toggle("is-active", i === idx));
          caps.forEach((c, i) => c.classList.toggle("is-active", i === idx));

          /* het volgende beeld alvast inladen, anders flikkert de
             crossfade de eerste keer */
          const next = shots[idx + 1];
          if (next) {
            const img = next.querySelector("img");
            if (img && img.loading === "lazy") img.loading = "eager";
            const src = shotSrc(next);
            if (src) new Image().src = src;
          }

          /* alleen de actieve shot speelt, zodra het video's worden */
          shots.forEach((s, i) => {
            const v = s.querySelector("video");
            if (!v) return;
            if (i === idx) v.play().catch(() => {});
            else v.pause();
          });
          stage.dataset.tone = caps[idx].dataset.tone || "light";
          stage.dataset.dock = stage.dataset.tone;
          if (counter) counter.textContent = String(idx + 1).padStart(2, "0");
          /* only the active chapter's video plays; others pause to
             save battery and bandwidth. Hero video has autoplay so it
             starts before JS, then this loop keeps it in line. */
          caps.forEach((c, i) => {
            const v = c.querySelector("video");
            if (!v) return;
            if (i === idx) {
              v.play().catch(() => {});
            } else {
              v.pause();
              try { v.currentTime = 0; } catch (_) {}
            }
          });
          activeIdx = idx;
        }

        // parallax the giant ghost word
        const ghost = caps[idx].querySelector("[data-parallax]");
        if (ghost) {
          const speed = parseFloat(ghost.dataset.parallaxSpeed || "0.08");
          const y = (0.5 - local) * 2 * speed * 320;
          ghost.style.setProperty("--py", `${y.toFixed(1)}px`);
        }

        // gentle upward drift of the chapter card through its slice
        const card = caps[idx].querySelector(".cap__card");
        if (card) {
          const drift = (0.5 - local) * 64;
          card.style.setProperty("--drift", `${drift.toFixed(1)}px`);
        }

        if (progress) progress.style.setProperty("--p", `${(p * 100).toFixed(1)}%`);
      };

      subscribers.add(update);
      window.addEventListener("resize", update);
      update();
    }
  }

  /* Mobile referenties: native horizontale touch-scroll via CSS,
     geen scroll-jack meer nodig. */

  /* ---- horizontaal scrollende card-grids: drag-to-scroll voor muis ----
     Op touch werkt swipe natief. Op desktop hebben users vaak geen
     horizontal-scroll affordance, dus we voegen click-and-drag toe en
     tonen een dunne scrollbar via CSS. */
  document
    .querySelectorAll(".cap__steps-grid, .cap__services-grid")
    .forEach((el) => {
      let isDown = false;
      let startX = 0;
      let startScroll = 0;
      let moved = false;
      el.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        isDown = true;
        moved = false;
        startX = e.pageX;
        startScroll = el.scrollLeft;
        el.classList.add("is-grabbing");
      });
      const release = () => {
        if (!isDown) return;
        isDown = false;
        el.classList.remove("is-grabbing");
      };
      el.addEventListener("mouseleave", release);
      window.addEventListener("mouseup", release);
      el.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        const dx = e.pageX - startX;
        if (Math.abs(dx) > 3) moved = true;
        el.scrollLeft = startScroll - dx;
      });
      // prevent the drag from triggering link clicks on cards
      el.addEventListener("click", (e) => {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
      // wheel: convert vertical wheel into horizontal scroll for mouse users
      el.addEventListener("wheel", (e) => {
        if (!window.matchMedia("(hover: hover)").matches) return;
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        // only horizontalize when the grid is actually overflowing
        if (el.scrollWidth <= el.clientWidth + 4) return;
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }, { passive: false });
    });

  /* ---- magnetic buttons ---- */
  if (!reduced && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      let raf = 0;
      const strength = 12;
      el.addEventListener("mousemove", (ev) => {
        const r = el.getBoundingClientRect();
        const x = ((ev.clientX - (r.left + r.width / 2)) / r.width) * strength;
        const y = ((ev.clientY - (r.top + r.height / 2)) / r.height) * strength;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
      });
      const reset = () => {
        cancelAnimationFrame(raf);
        el.style.transform = "translate3d(0,0,0)";
      };
      el.addEventListener("mouseleave", reset);
      el.addEventListener("blur", reset);
    });
  }

  /* ---- page transitions ----
     Modern browsers gebruiken @view-transition (cross-document) uit de
     CSS automatisch. Voor browsers zonder support animeren we zelf een
     curtain naar opaque, dan navigeren. */
  const curtain = document.querySelector("[data-page-curtain]");
  const supportsCrossDocVT =
    typeof document.startViewTransition === "function" &&
    "viewTransition" in document &&
    CSS.supports("selector(::view-transition)");

  if (curtain && !supportsCrossDocVT) {
    const shouldIntercept = (a) => {
      if (!a || !a.href) return false;
      if (a.target && a.target !== "_self") return false;
      if (a.hasAttribute("download")) return false;
      if (a.dataset.noTransition !== undefined) return false;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return false;
      if (url.protocol !== "http:" && url.protocol !== "https:") return false;
      if (url.pathname === location.pathname) return false;
      return true;
    };
    document.addEventListener("click", (e) => {
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const a = e.target.closest("a[href]");
      if (!shouldIntercept(a)) return;
      e.preventDefault();
      curtain.classList.add("is-active");
      const href = a.href;
      window.setTimeout(() => {
        window.location.href = href;
      }, 880);
    });
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) curtain.classList.remove("is-active");
    });
  }

  /* ---- mobile fullscreen menu ---- */
  const menuBtn = document.querySelector(".dock__menu-btn");
  const menuOverlay = document.getElementById("mobile-menu");
  if (menuBtn && menuOverlay) {
    const closeBtn = menuOverlay.querySelector(".menu-overlay__close");
    const links = menuOverlay.querySelectorAll("a");
    const openMenu = () => {
      menuOverlay.classList.add("is-open");
      menuOverlay.setAttribute("aria-hidden", "false");
      menuBtn.setAttribute("aria-expanded", "true");
      menuBtn.setAttribute("aria-label", "Menu sluiten");
      document.body.classList.add("menu-open");
      if (lenis) lenis.stop();
    };
    const closeMenu = () => {
      menuOverlay.classList.remove("is-open");
      menuOverlay.setAttribute("aria-hidden", "true");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Menu openen");
      document.body.classList.remove("menu-open");
      if (lenis) lenis.start();
    };
    menuBtn.addEventListener("click", () => {
      menuOverlay.classList.contains("is-open") ? closeMenu() : openMenu();
    });
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    links.forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menuOverlay.classList.contains("is-open")) closeMenu();
    });
  }
})();
