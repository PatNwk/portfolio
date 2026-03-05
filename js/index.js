document.addEventListener("scroll", function () {
    let scrollPosition = window.scrollY;
    document.querySelector(".france").style.transform = `translateY(${scrollPosition * 0.2}px)`;
    document.querySelector(".pologne").style.transform = `translateY(${scrollPosition * 0.3}px)`;
    document.querySelector(".Shoot").style.transform = `translateY(${scrollPosition * 0.1}px)`;
});

document.addEventListener("scroll", function () {
    let scrollPosition = window.scrollY;

    document.querySelector(".france").style.transform = `translateY(${scrollPosition * 0.2}px)`;
    document.querySelector(".pologne").style.transform = `translateY(${scrollPosition * 0.3}px)`;
    document.querySelector(".Shoot").style.transform = `translateY(${scrollPosition * 0.1}px)`;

    let quote = document.querySelector(".quote h2");
    let author = document.querySelector(".quote .author");
    let quoteSection = document.querySelector(".quote");

    let windowHeight = window.innerHeight;
    let quoteTop = quoteSection.getBoundingClientRect().top;

    if (quoteTop < windowHeight / 1.5) {
        quote.style.color = "black"; 
        author.style.color = "black";
    } else {
        quote.style.color = "rgb(150, 150, 150)";
        author.style.color = "rgb(150, 150, 150)";
    }
});