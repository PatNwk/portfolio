document.addEventListener("DOMContentLoaded", () => {
    const languages = [
        "SKONTAKTUJ SIĘ ZE MNĄ",
        "KONTAKTIERE MICH",
        "CONTATTAMI",
        "اتصل بي",
        "CONTÁCTAME",
        "連絡してください",
        "연락해주세요",
    ];
    const textElement = document.querySelector(".Langue h2");
    let languageIndex = 0;

    if (textElement) {
        function changeText() {
            textElement.style.opacity = "0";

            setTimeout(() => {
                textElement.textContent = languages[languageIndex];
                textElement.style.opacity = "1";
                languageIndex = (languageIndex + 1) % languages.length;
            }, 500);
        }

        setInterval(changeText, 3000);
    }

    const timeElement = document.getElementById("current-time-location") || document.querySelector(".location");

    function updateTime() {
        if (!timeElement) {
            return;
        }

        const now = new Date();
        const timeString = now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Europe/Paris",
        });

        timeElement.textContent = `${timeString} Auribeau-sur-Siagne, PACA`;
    }

    updateTime();
    setInterval(updateTime, 60000);

    const menuIcon = document.querySelector(".menu-icon");
    const nav = document.getElementById("main-nav");

    if (menuIcon && nav) {
        menuIcon.addEventListener("click", () => {
            nav.classList.toggle("open");
            menuIcon.classList.toggle("open");
        });

        nav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                nav.classList.remove("open");
                menuIcon.classList.remove("open");
            });
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 768) {
                nav.classList.remove("open");
                menuIcon.classList.remove("open");
            }
        });
    }
});
