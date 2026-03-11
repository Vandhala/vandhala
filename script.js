const { gsap } = window;
let lampIsOn = true; 

// --- 1. KOMPONENT-LADDARE (Hämtar Nav & Footer) ---
async function loadComponent(elementId, fileName) {
    try {
        const response = await fetch(fileName);
        if (!response.ok) throw new Error('Kunde inte hitta filen');
        const data = await response.text();
        document.getElementById(elementId).innerHTML = data;
        
        // Starta funktioner som beror på den laddade HTML-koden
        if (elementId === 'nav-placeholder') {
            initializeLamp(); 
        }
        if (elementId === 'footer-placeholder') {
            updateFooterQuote(); 
        }
    } catch (error) {
        console.warn("Kunde inte ladda komponenten:", error);
    }
}

// --- 2. LAMP-LOGIK (Körs först när naven har landat) ---
function initializeLamp() {
    const HIT = document.querySelector('.toggle-scene__hit-spot');
    const DUMMY_CORD = document.querySelector('.toggle-scene__dummy-cord line');
    const ENDY = 380.5405;
    const lampHint = document.getElementById('lamp-hint');

    if (!HIT || !DUMMY_CORD) return;

    // Timer för hint-texten
    if (lampHint) {
        setTimeout(() => {
            if (lampHint.style.display !== 'none') {
                gsap.to(lampHint, { opacity: 0, duration: 1, onComplete: () => lampHint.style.display = 'none' });
            }
        }, 20000);
    }

    Draggable.create(document.createElement('div'), {
        trigger: HIT,
        type: 'y',
        onDrag: function() {
            gsap.set(DUMMY_CORD, { attr: { y2: ENDY + this.y } });
        },
        onRelease: function() {
            gsap.to(DUMMY_CORD, {
                attr: { y2: ENDY },
                duration: 0.3,
                ease: "elastic.out(1, 0.3)",
                onComplete: () => {
                    if (this.y > 30) {
                        lampIsOn = !lampIsOn;
                        document.documentElement.setAttribute('data-theme', lampIsOn ? 'light' : 'dark');
                        if (lampHint) lampHint.style.display = 'none';
                        
                        // Uppdatera båda sidornas logik vid behov
                        updateDynamicGreeting(); 
                        updateMeditationHero();
                    }
                }
            });
        }
    });
}

// --- 3. DYNAMISK HÄLSNING (Startsidan) ---
async function updateDynamicGreeting() {
    const greetingElement = document.getElementById('greeting-text');
    if (!greetingElement) return; // Kör bara om vi är på startsidan

    const now = new Date();
    const hours = now.getHours();
    const dayName = now.toLocaleDateString('sv-SE', { weekday: 'long' }).toLowerCase();
    
    const dailyExercises = {
        "måndag": "Måndag är en bra dag för att sätta en intention. Vad vill du bjuda in i ditt liv under de kommande sju dagarna?",
        "tisdag": "Tisdag handlar om riktning. Ta ett djupt andetag och låt din energi flöda mot det som faktiskt betyder något för dig.",
        "onsdag": "Onsdag är veckans mittpunkt. Stanna upp en stund och känn efter: vad behöver du just nu för att hitta din inre jämvikt?",
        "torsdag": "Torsdag är en dag för reflektion. Se dig omkring och nämn tre små saker som du är tacksam för i detta nu.",
        "fredag": "Fredag är tiden för att rensa. Andas ut veckans stress och gör plats för den stillhet som väntar under helgen.",
        "lördag": "Lördag är en dag för att bara vara. Tillåt dig själv att utforska din inre värld utan krav på prestation eller mål.",
        "söndag": "Söndag, kom ihåg att varva ner helt. Låt själen hinna ikapp och ladda dina batterier inför en ny cykel."
    };

    const heroImage = document.getElementById('hero-image');
    const heroTitle = document.getElementById('hero-title');
    
    let greeting = "Hej";
    let imageUrl = "images/dag.jpg"; 

    if (hours >= 5 && hours < 10) { greeting = "God morgon"; imageUrl = "images/morgon.jpg"; }
    else if (hours >= 10 && hours < 18) { greeting = "Hoppas du har en bra dag"; imageUrl = "images/dag.jpg"; }
    else { greeting = (hours >= 18 && hours < 23) ? "God kväll" : "God natt"; imageUrl = "images/kvall.jpg"; }

    if (heroImage) heroImage.src = imageUrl;
    if (heroTitle) heroTitle.innerText = greeting + "!";
    greetingElement.innerText = dailyExercises[dayName] || `Ha en fin ${dayName}!`;
}

// --- 4. DYNAMISK HERO (Meditationssidan) ---
function updateMeditationHero() {
    const heroCard = document.getElementById('dynamic-hero-card');
    if (!heroCard) return; // Kör bara om vi är på meditationssidan

    const now = new Date();
    const hours = now.getHours();
    const heroTitle = document.getElementById('dynamic-hero-title');
    const heroTime = document.getElementById('dynamic-hero-time');

    let title = "DAGENS FLOW";
    let img = "images/dag.jpg";
    let time = "10 min";

    if (hours >= 5 && hours < 10) {
        title = "MORGON-FLOW";
        img = "images/morgon.jpg";
        time = "10 min";
    } else if (hours >= 10 && hours < 18) {
        title = "MINSKA STRESS";
        img = "images/dag.jpg";
        time = "5 min";
    } else {
        title = "KVÄLLSRO";
        img = "images/kvall.jpg";
        time = "20 min";
    }

    if (heroTitle) heroTitle.innerText = title;
    if (heroTime) heroTime.innerText = `Tid kvar: ${time}`;
    heroCard.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url('${img}')`;
}

// --- 5. SLUMPVALT CITAT I FOOTER ---
function updateFooterQuote() {
    const quotes = [
        "Stillhet är inte frånvaro av ljud, utan närvaro av harmoni.",
        "Andetaget är bron som förenar din kropp med din själ.",
        "Varje ögonblick är en ny möjlighet att landa i dig själv.",
        "Ditt lugn är din superkraft."
    ];
    const quoteElement = document.getElementById('footer-quote');
    if (quoteElement) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteElement.innerText = `"${quotes[randomIndex]}"`;
    }
}

// --- 6. BIL OCH PRATBUBBLA ---
const textTarget = document.getElementById("typing-text");
const fullText = "Nu startar din inre resa, vill du veta mer vem som sitter bredvid dig i passagerarsätet? Läs mer om vandhala!";
let isDeleting = false;
let currentText = "";
let speed = 60; 

function typeLoop() {
    if (!textTarget) return;
    currentText = isDeleting ? fullText.substring(0, currentText.length - 1) : fullText.substring(0, currentText.length + 1);
    textTarget.innerHTML = currentText;
    if (!isDeleting && currentText === fullText) { speed = 3000; isDeleting = true; }
    else if (isDeleting && currentText === "") { isDeleting = false; speed = 500; }
    setTimeout(typeLoop, isDeleting ? 30 : 60);
}

// --- STARTA ALLT ---
document.addEventListener("DOMContentLoaded", () => {
    // Ladda templates
    loadComponent('nav-placeholder', 'nav-template.html');
    loadComponent('footer-placeholder', 'footer-template.html');
    
    // Kör logik
    updateDynamicGreeting();
    updateMeditationHero();
    setTimeout(typeLoop, 1000);
});

// Uppdatera var 30:e minut
setInterval(() => {
    updateDynamicGreeting();
    updateMeditationHero();
}, 1800000);