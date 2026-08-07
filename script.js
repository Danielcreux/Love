const nav = document.querySelector(".nav");
const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#main-menu");
const navLinks = [...document.querySelectorAll("#main-menu a")];

const closeMenu = () => {
  menu.classList.remove("open");
  menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
};

menuToggle.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach(link => link.addEventListener("click", closeMenu));

window.addEventListener("scroll", () => {
  nav.classList.toggle("sticky", window.scrollY > 120);
}, { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

const stats = document.querySelector(".stats");
let statsPlayed = false;
const statsObserver = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting || statsPlayed) return;
  statsPlayed = true;
  document.querySelectorAll("[data-count]").forEach((number) => {
    const target = Number(number.dataset.count);
    const duration = 1400;
    const started = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      number.textContent = Math.round(target * eased).toLocaleString("es-ES");
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: .5 });
statsObserver.observe(stats);

const sections = [...document.querySelectorAll("main section[id], .story-wrap[id]")];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach(link => {
      const href = link.getAttribute("href").slice(1);
      const active = href === id || (id === "tiempo" && href === "inicio");
      link.classList.toggle("active", active);
    });
  });
}, { rootMargin: "-35% 0px -55% 0px" });
sections.forEach(section => sectionObserver.observe(section));

const playButton = document.querySelector(".play");
const playIcon = playButton.querySelector("span");
const audio = document.querySelector("#relationship-song");
const progressFill = document.querySelector(".progress-fill");
const progressDot = document.querySelector(".progress-dot");
const currentTime = document.querySelector("#current-time");
const totalTime = document.querySelector("#total-time");
const progress = document.querySelector(".progress");

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

const renderProgress = () => {
  const percentage = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  progressFill.style.width = `${percentage}%`;
  progressDot.style.left = `${percentage}%`;
  currentTime.textContent = formatTime(audio.currentTime);
};

playButton.addEventListener("click", async () => {
  if (audio.paused) {
    try {
      await audio.play();
    } catch {
      playIcon.textContent = "▶";
    }
  } else {
    audio.pause();
  }
});

progress.addEventListener("click", (event) => {
  if (!Number.isFinite(audio.duration)) return;
  const rect = progress.getBoundingClientRect();
  const percentage = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
  audio.currentTime = percentage * audio.duration;
  renderProgress();
});

audio.addEventListener("loadedmetadata", () => {
  totalTime.textContent = formatTime(audio.duration);
  renderProgress();
});
audio.addEventListener("timeupdate", renderProgress);
audio.addEventListener("play", () => {
  playIcon.textContent = "Ⅱ";
  playButton.setAttribute("aria-label", "Pausar");
});
audio.addEventListener("pause", () => {
  playIcon.textContent = "▶";
  playButton.setAttribute("aria-label", "Reproducir");
});
audio.addEventListener("ended", renderProgress);

document.querySelector(".favorite").addEventListener("click", (event) => {
  event.currentTarget.classList.toggle("on");
  event.currentTarget.textContent = event.currentTarget.classList.contains("on") ? "♥" : "♡";
});

const modal = document.querySelector(".surprise-modal");
const openModal = () => {
  modal.hidden = false;
  document.body.classList.add("modal-open");
  document.querySelector(".modal-close").focus();
};
const closeModal = () => {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  document.querySelector(".surprise-trigger").focus();
};

document.querySelector(".surprise-trigger").addEventListener("click", openModal);
document.querySelector(".modal-close").addEventListener("click", closeModal);
document.querySelector(".modal-backdrop").addEventListener("click", closeModal);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !modal.hidden) closeModal();
});
