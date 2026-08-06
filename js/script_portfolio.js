(() => {
    const projectContainers = document.querySelectorAll(".project-container");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!projectContainers.length) {
        return;
    }

    function revealProject(project) {
        const delay = prefersReducedMotion
            ? 0
            : Number.parseInt(project.getAttribute("data-delay"), 10) || 0;

        window.setTimeout(() => {
            project.classList.add("visible");
        }, delay);
    }

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    revealProject(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.14 });

        projectContainers.forEach(project => observer.observe(project));
        return;
    }

    function revealProjectsOnScroll() {
        projectContainers.forEach(project => {
            const rect = project.getBoundingClientRect();

            if (rect.top < window.innerHeight && rect.bottom > 0 && !project.classList.contains("visible")) {
                revealProject(project);
            }
        });
    }

    window.addEventListener("scroll", revealProjectsOnScroll, { passive: true });
    revealProjectsOnScroll();
})();
