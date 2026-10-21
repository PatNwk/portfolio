(() => {
    const header = document.querySelector("body > header:not(.navbar)");
    const menuButton = document.querySelector(".menu-icon");
    const nav = document.getElementById("main-nav");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reducedMotion && "IntersectionObserver" in window) {
        document.documentElement.classList.add("js-motion");
    }

    document.querySelectorAll(".site-header a.active").forEach(link => {
        link.setAttribute("aria-current", "page");
    });

    function closeMenu() {
        if (!menuButton || !nav) return;
        nav.classList.remove("open");
        menuButton.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open menu");
        document.body.classList.remove("menu-open");
    }

    if (menuButton && nav) {
        menuButton.addEventListener("click", () => {
            const willOpen = !nav.classList.contains("open");
            nav.classList.toggle("open", willOpen);
            menuButton.classList.toggle("open", willOpen);
            menuButton.setAttribute("aria-expanded", String(willOpen));
            menuButton.setAttribute("aria-label", willOpen ? "Close menu" : "Open menu");
            document.body.classList.toggle("menu-open", willOpen);
        });

        nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
        window.addEventListener("resize", () => {
            if (window.innerWidth > 900) closeMenu();
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && nav.classList.contains("open")) {
                closeMenu();
                menuButton.focus();
            }
        });
    }

    if (header) {
        const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });
    }

    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach(element => {
        const delay = Number.parseInt(element.dataset.delay, 10);
        if (Number.isFinite(delay)) element.style.setProperty("--reveal-delay", `${delay}ms`);
    });

    if (reducedMotion || !("IntersectionObserver" in window)) {
        revealElements.forEach(element => element.classList.add("is-visible"));
    } else {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -5%" });

        revealElements.forEach(element => observer.observe(element));
    }

    if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
        document.querySelectorAll(".spotlight-card").forEach(card => {
            card.addEventListener("pointermove", event => {
                const bounds = card.getBoundingClientRect();
                card.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
                card.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
            });
        });
    }

    document.querySelectorAll("[data-current-year]").forEach(element => {
        element.textContent = new Date().getFullYear();
    });
})();
