const projectContainers = document.querySelectorAll('.project-container');
        const projectImages = document.querySelectorAll('.move-on-scroll');

        function revealProjectsOnScroll() {
            const scrollY = window.scrollY;

            projectContainers.forEach(project => {
                const rect = project.getBoundingClientRect();
                const projectTop = rect.top;
                const projectBottom = rect.bottom;
                const delay = parseInt(project.getAttribute('data-delay'));

                if (projectTop < window.innerHeight && projectBottom > 0) {
                    setTimeout(() => {
                        project.classList.add('visible');
                    }, delay);
                }
            });

            projectImages.forEach(img => {
                const rect = img.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    img.style.transform = 'translateY(0)';
                } else {
                    img.style.transform = 'translateY(50px)';
                }
            });
        }

        window.addEventListener('scroll', revealProjectsOnScroll);