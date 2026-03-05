
    document.addEventListener("DOMContentLoaded", function() {
        const languages = [ "SKONTAKTUJ SIĘ ZE MNĄ", "KONTAKTIERE MICH", "CONTATTAMI","اتصل بي", "CONTÁCTAME","連絡してください","연락해주세요"];
        let index = 0;
        const textElement = document.querySelector(".Langue h2");

        function changeText() {
            textElement.style.opacity = "0";  
            setTimeout(() => {
                textElement.textContent = languages[index];
                textElement.style.opacity = "1"; 
                index = (index + 1) % languages.length; 
            }, 500); 
        }

        setInterval(changeText, 3000); 
    });

    function updateTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        document.querySelector('.location').textContent = `${hours}:${minutes} Auribeau-Sur-Siagne, PACA`;
    }
    
    setInterval(updateTime, 1000);
    
    updateTime();
    