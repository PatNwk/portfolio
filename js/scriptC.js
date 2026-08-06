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
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (textElement && !reducedMotion) {
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

});
