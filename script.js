// ======================================================
// TEMA CLARO / OSCURO
// Mismo mecanismo que la app: atributo data-theme en <html>.
// Sin preferencia guardada, sigue al sistema (prefers-color-scheme).
// ======================================================

const root = document.documentElement;
const themeBtn = document.querySelector(".theme-btn");
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

function isDark() {
    const forced = root.getAttribute("data-theme");
    return forced ? forced === "dark" : darkQuery.matches;
}

function updateThemeButton() {
    if (!themeBtn) return;
    const dark = isDark();
    themeBtn.textContent = dark ? "☀" : "☾";
    themeBtn.setAttribute("aria-label", dark ? "Activar modo claro" : "Activar modo oscuro");
    themeBtn.title = dark ? "Modo claro" : "Modo oscuro";
}

// Cada captura tiene su versión clara y oscura (data-light / data-dark)
function updateScreenshotTheme() {
    const dark = isDark();
    document.querySelectorAll("img[data-dark][data-light]").forEach(img => {
        const next = dark ? img.dataset.dark : img.dataset.light;
        if (next && img.getAttribute("src") !== next) img.setAttribute("src", next);
    });
}

function applyTheme() {
    updateThemeButton();
    updateScreenshotTheme();
}

themeBtn?.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("tandar-theme", next); } catch (e) {}
    applyTheme();
});

// Si el sistema cambia y el usuario no forzó un tema, acompañarlo
darkQuery.addEventListener("change", () => {
    if (!root.hasAttribute("data-theme")) applyTheme();
});

applyTheme();


// ======================================================
// ANIMACIÓN DE ENTRADA (solo fundido)
// ======================================================

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));


// ======================================================
// MENÚ MOBILE (el estilo vive en CSS: .nav-links.open)
// ======================================================

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

function setMenu(open) {
    navLinks?.classList.toggle("open", open);
    menuBtn?.setAttribute("aria-expanded", String(open));
    menuBtn?.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
}

menuBtn?.addEventListener("click", () => {
    setMenu(!navLinks.classList.contains("open"));
});

document.addEventListener("keydown", e => {
    if (e.key === "Escape") setMenu(false);
});


// ======================================================
// SCROLL SUAVE A LAS SECCIONES
// ======================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
        const target = document.querySelector(anchor.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        setMenu(false);
    });
});


// ======================================================
// LINK ACTIVO EN LA NAVBAR SEGÚN LA SECCIÓN VISIBLE
// ======================================================

const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = navAnchors
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(a => {
            a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
        });
    });
}, { rootMargin: "-40% 0px -55% 0px" });

sections.forEach(s => spy.observe(s));
