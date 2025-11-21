/* ==========================================================
   FINAL script.js — Fujifilm XT Edition
   - camera intro with shutter sound + close animation
   - lazy-load blur-up with spinner auto-hide
   - peek carousel (auto + dots + keyboard)
   - gallery → lightbox
   - smooth scrolling + scroll reveal
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ------------------------------
     FOOTER YEAR
  ------------------------------ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();



  /* ------------------------------
     FUJIFILM CAMERA INTRO
  ------------------------------ */
  const intro = document.getElementById("intro");
  const shutterBtn = document.getElementById("cameraShutter");
  const site = document.getElementById("site");

  const shutterSound = document.getElementById("shutterSound");

  function revealSite() {
    if (!intro || !site) return;

    // Play shutter sound
    if (shutterSound) {
      shutterSound.currentTime = 0;
      shutterSound.play().catch(() => {});
    }

    // Trigger camera shrink → fade animation
    intro.classList.add("closing");

    setTimeout(() => {
      intro.setAttribute("aria-hidden", "true");
      site.classList.remove("site-hidden");
      site.classList.add("revealed");
      site.setAttribute("aria-hidden", "false");

      // Keyboard friendliness
      const firstLink = document.querySelector(".nav a");
      if (firstLink) firstLink.focus();
    }, 620); // matches CSS animation
  }

  if (shutterBtn) {
    shutterBtn.addEventListener("click", revealSite);

    shutterBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        revealSite();
      }
    });
  }

  // Escape key also reveals site
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && intro && !site.classList.contains("revealed")) {
      revealSite();
    }
  });



  /* ------------------------------
     PROGRESSIVE BLUR-UP IMAGES
     + spinner removal
  ------------------------------ */
  const progressiveImgs = document.querySelectorAll("img.progressive");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const img = entry.target;
        const highSrc = img.dataset.src;

        // spinner located beside image
        const spinner = img.parentElement.querySelector(".spinner");

        if (highSrc) {
          const loader = new Image();
          loader.src = highSrc;

          loader.onload = () => {
            img.src = highSrc;
            img.classList.add("loaded");
            if (spinner) spinner.style.display = "none";
          };

          loader.onerror = () => {
            img.classList.add("loaded");
            if (spinner) spinner.style.display = "none";
          };
        } else {
          img.onload = () => {
            img.classList.add("loaded");
            if (spinner) spinner.style.display = "none";
          };
        }

        obs.unobserve(img);
      });
    }, { rootMargin: "200px 0px", threshold: 0.01 });

    progressiveImgs.forEach((img) => observer.observe(img));
  } else {
    // no observer → reveal instantly
    progressiveImgs.forEach((img) => {
      const spinner = img.parentElement.querySelector(".spinner");
      if (img.dataset.src) img.src = img.dataset.src;
      img.classList.add("loaded");
      if (spinner) spinner.style.display = "none";
    });
  }



  /* ------------------------------
     CAROUSEL — PEEK STYLE
  ------------------------------ */
  (function initCarousel() {
    const track = document.querySelector(".carousel-track");
    const wrapper = document.querySelector(".carousel-track-wrapper");
    if (!track || !wrapper) return;

    const slides = [...track.children];
    const prevBtn = document.querySelector(".carousel-btn.prev");
    const nextBtn = document.querySelector(".carousel-btn.next");
    const dotsWrap = document.querySelector(".dots");

    let index = 0;
    const gap = 14; // match CSS gap

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", `Slide ${i + 1}`);
      if (i === 0) dot.classList.add("active");

      dot.addEventListener("click", () => {
        index = i;
        update();
        resetAuto();
      });

      dotsWrap.appendChild(dot);
    });

    const dots = [...dotsWrap.children];

    function slideW() {
      return slides[0].getBoundingClientRect().width;
    }

    function update() {
      const offset = index * (slideW() + gap);
      track.style.transform = `translateX(-${offset}px)`;

      dots.forEach((d, i) => d.classList.toggle("active", i === index));
    }

    function next() {
      index = (index + 1) % slides.length;
      update();
    }
    function prev() {
      index = (index - 1 + slides.length) % slides.length;
      update();
    }

    if (nextBtn) nextBtn.addEventListener("click", () => { next(); resetAuto(); });
    if (prevBtn) prevBtn.addEventListener("click", () => { prev(); resetAuto(); });

    let auto = setInterval(next, 4200);
    function resetAuto() {
      clearInterval(auto);
      auto = setInterval(next, 4200);
    }

    window.addEventListener("resize", () => setTimeout(update, 120));

    // keyboard control
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    });

    // slides → lightbox
    slides.forEach((slide, i) => {
      const img = slide.querySelector("img");
      if (img) img.addEventListener("click", () => {
        const list = slides.map(s => s.querySelector("img").dataset.src || s.querySelector("img").src);
        openLightbox(list, i);
      });
    });

    setTimeout(update, 120);
  })();



  /* ------------------------------
     LIGHTBOX
  ------------------------------ */
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbCap = document.getElementById("lightboxCaption");
  const lbClose = document.querySelector(".lightbox-close");
  const lbPrev = document.querySelector(".lightbox-prev");
  const lbNext = document.querySelector(".lightbox-next");

  let lbList = [];
  let lbIndex = 0;

  function openLightbox(list, index) {
    lbList = list.slice();
    lbIndex = index;
    renderLB();
  }

  function renderLB() {
    lbImg.src = lbList[lbIndex];
    lbCap.textContent = `${lbIndex + 1} / ${lbList.length}`;
    lb.classList.remove("hide");
    lb.setAttribute("aria-hidden", "false");
  }

  function closeLB() {
    lb.classList.add("hide");
    lb.setAttribute("aria-hidden", "true");
  }

  function nextLB() { lbIndex = (lbIndex + 1) % lbList.length; renderLB(); }
  function prevLB() { lbIndex = (lbIndex - 1 + lbList.length) % lbList.length; renderLB(); }

  // gallery images
  const galleryImgs = [...document.querySelectorAll(".lightbox-target")];
  if (galleryImgs.length) {
    const srcList = galleryImgs.map(img => img.dataset.src || img.src);
    galleryImgs.forEach((img, i) => {
      img.addEventListener("click", () => openLightbox(srcList, i));
    });
  }

  if (lbClose) lbClose.addEventListener("click", closeLB);
  if (lbNext) lbNext.addEventListener("click", nextLB);
  if (lbPrev) lbPrev.addEventListener("click", prevLB);

  // keyboard control
  window.addEventListener("keydown", (e) => {
    if (lb.classList.contains("hide")) return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowRight") nextLB();
    if (e.key === "ArrowLeft") prevLB();
  });

  // outside click closes
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLB();
  });



  /* ------------------------------
     SMOOTH SCROLL
  ------------------------------ */
  document.querySelectorAll(".nav a").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });



  /* ------------------------------
     SCROLL REVEAL
  ------------------------------ */
  if ("IntersectionObserver" in window) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) en.target.classList.add("inview");
      });
    }, { threshold: 0.15 });

    document
      .querySelectorAll(".about, .carousel-section, .gallery, .contact")
      .forEach((sec) => {
        sec.classList.add("will-inview");
        revealObs.observe(sec);
      });
  } else {
    document
      .querySelectorAll(".about, .carousel-section, .gallery, .contact")
      .forEach((sec) => sec.classList.add("inview"));
  }

});
