const { gsap } = window;

// --- 0. HÄMTA SPARAT TEMA ---
let savedTheme = localStorage.getItem('theme') || 'light';
let lampIsOn = savedTheme === 'light';

// Applicera temat direkt på <html> så att sidan laddas med rätt färger direkt
document.documentElement.setAttribute('data-theme', savedTheme);

// --- 1. KOMPONENT-LADDARE ---
//-ny testkod-//
// --- UPPDATERAD KOMPONENT-LADDARE ---
async function loadComponent(elementId, fileName) {
    try {
        // Fixar sökvägen så den fungerar både lokalt och på GitHub Pages
        const isGitHub = window.location.hostname.includes('github.io');
        const repoName = '/vandhala/';
        
        let fetchPath = fileName;
        
        // Om vi skickar in en sökväg som börjar med ../ så behåller vi den, 
        // annars fixar vi bas-sökvägen
        if (!fileName.startsWith('..')) {
            fetchPath = isGitHub ? repoName + fileName : '/' + fileName;
        }

        const response = await fetch(fetchPath);
        if (!response.ok) throw new Error(`Kunde inte hitta: ${fetchPath}`);
        
        const data = await response.text();
        document.getElementById(elementId).innerHTML = data;
        
        // När naven är laddad, kör vi alla funktioner som berör menyn
        if (elementId === 'nav-placeholder') {
            // Starta lampan (Se till att din funktion heter initializeLamp i script.js)
            if (typeof initializeLamp === 'function') {
                initializeLamp(); 
            }
            
            // Fixa aktiv länk i menyn
            const currentPath = window.location.pathname;
            const navLinks = document.querySelectorAll('.nav-link');

            navLinks.forEach(link => {
                const linkHref = link.getAttribute('href');
                if (linkHref && currentPath.includes(linkHref.replace('.html', ''))) {
                    link.classList.add('active');
                }
            });

            // Starta Bootstrap-menyn (offcanvas)
            const offcanvasElement = document.getElementById('offcanvasNavbar');
            if (offcanvasElement && window.bootstrap) {
                new bootstrap.Offcanvas(offcanvasElement);
            }
        }

        if (elementId === 'footer-placeholder') {
            if (typeof updateFooterQuote === 'function') {
                updateFooterQuote(); 
            }
        }
    } catch (error) {
        console.warn("Laddningsfel:", error);
    }
}
//---kanske nyt tillbaka till hit - kod finns i anteckning

// --- 2. LAMP-LOGIK ---
//--- lamptest
function initializeLamp() {
    const HIT = document.querySelector('.toggle-scene__hit-spot');
    const DUMMY_CORD = document.querySelector('.toggle-scene__dummy-cord line');
    const ENDY = 380.5405;
    const lampHint = document.getElementById('lamp-hint');

    if (!HIT || !DUMMY_CORD) return;

    // --- NYTT: Kolla om användaren redan har sett instruktionen ---
    const hasUsedLamp = localStorage.getItem('hasUsedLamp') === 'true';
    
    if (hasUsedLamp && lampHint) {
        lampHint.style.display = 'none';
    } else if (lampHint) {
        // Om de inte använt den förut, visa den men dölj efter 15 sekunder
        lampHint.style.display = 'block';
        setTimeout(() => {
            gsap.to(lampHint, { opacity: 0, duration: 1, onComplete: () => lampHint.style.display = 'none' });
        }, 15000);
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
                        const newTheme = lampIsOn ? 'light' : 'dark';
                        
                        document.documentElement.setAttribute('data-theme', newTheme);
                        localStorage.setItem('theme', newTheme);
                        
                        // --- NYTT: Markera att de lärt sig lampan ---
                        localStorage.setItem('hasUsedLamp', 'true');
                        
                        if (lampHint) {
                            gsap.to(lampHint, { opacity: 0, duration: 0.5, onComplete: () => lampHint.style.display = 'none' });
                        }
                        
                        updateDynamicGreeting(); 
                        updateMeditationHero();
                    }
                }
            });
        }
    });
}
//-- lamptest slut


// --- 3. DYNAMISK HÄLSNING (Startsidan) ---
async function updateDynamicGreeting() {
    const greetingElement = document.getElementById('greeting-text');
    const heroImage = document.getElementById('hero-image');
    
    if (!greetingElement && !heroImage) return; 

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

    const heroTitle = document.getElementById('hero-title');
    let greeting = "Hej";
    let imageUrl = "images/dag.jpg"; 

    if (hours >= 5 && hours < 10) { greeting = "God morgon"; imageUrl = "images/morgon.jpg"; }
    else if (hours >= 10 && hours < 18) { greeting = "Hoppas du har en bra dag"; imageUrl = "images/dag.jpg"; }
    else { greeting = (hours >= 18 && hours < 23) ? "God kväll" : "God natt"; imageUrl = "images/kvall.jpg"; }

    if (heroImage) heroImage.src = imageUrl;
    if (heroTitle) heroTitle.innerText = greeting + "!";
    if (greetingElement) greetingElement.innerText = dailyExercises[dayName] || `Ha en fin ${dayName}!`;
}

// --- 4. DYNAMISK HERO (Meditationssidan) ---
// --- 4. DYNAMISK HERO (Fungerar nu på både Startsida & Meditationssida) ---
function updateMeditationHero() {
    // Vi kollar efter båda sidornas ID:n med || (som betyder "eller")
    const glassTitle = document.getElementById('dynamic-glass-title') || document.getElementById('meditation-title-top');
    const glassText = document.getElementById('dynamic-glass-text') || document.getElementById('meditation-text');
    const glassLink = document.getElementById('dynamic-glass-link') || document.getElementById('meditation-link');
    
    // Visuella element
    const heroCard = document.getElementById('dynamic-hero-card'); // För meditationssidan
    const sideImg = document.getElementById('meditation-side-img'); // För startsidan (kräver id i HTML)

    const now = new Date();
    const hours = now.getHours();
    
    let title, text, img, link;

    if (hours >= 5 && hours < 10) {
        title = "Morgonmeditation";
        text = "Starta dagen med harmoni, det förtjänar du";
        img = "images/morgon.jpg";
        link = "morgon-meditation.html";
    } else if (hours >= 10 && hours < 18) {
        title = "Dagsmeditation";
        text = "Hitta fokus mitt i vardagen, det förtjänar du";
        img = "images/dag.jpg";
        link = "dag-meditation.html";
    } else {
        title = "Kvällsmeditation";
        text = "Landa i stillhet inför natten, det förtjänar du";
        img = "images/kvall.jpg";
        link = "kvall-meditation.html";
    }

    // Uppdatera texter om elementen finns på sidan
    if (glassTitle) glassTitle.innerText = title;
    if (glassText) glassText.innerText = text;
    if (glassLink) glassLink.href = link;
    
    // Uppdatera bakgrundsbild (Meditationssidan)
    if (heroCard) {
        heroCard.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url('${img}')`;
    }

    // Uppdatera bildkälla (Startsidan - kom ihåg att lägga till id="meditation-side-img" på din <img>)
    if (sideImg) {
        sideImg.src = img;
    }
}

// --- 5. SLUMPVALT CITAT ---
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

// sökfunktion

// Data för dina meditationer
const meditations = [
    { title: "Morgonstund", tags: ["morgon", "energi", "vakna"], url: "morgonstund.html", img: "images/morgon.jpg", time: "10 min" },
    { title: "Stressa ner", tags: ["stress", "lugn", "paus", "oro"], url: "stressa-ner.html", img: "images/dag.jpg", time: "5 min" },
    { title: "Kvällsro", tags: ["sömn", "kväll", "vila", "trött"], url: "kvallsro.html", img: "images/kvall.jpg", time: "20 min" },
    { title: "Kreativt Flow", tags: ["skapa", "fokus", "ideer"], url: "kreativt-flode.html", img: "images/dag.jpg", time: "15 min" }
];

const searchInput = document.getElementById('meditation-search');
const resultsContainer = document.getElementById('search-results');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        if (query.length > 1) {
            // Filtrera meditationer baserat på titel eller taggar
            const filtered = meditations.filter(m => 
                m.title.toLowerCase().includes(query) || 
                m.tags.some(tag => tag.includes(query))
            );

            displayResults(filtered);
        } else {
            resultsContainer.style.display = 'none';
        }
    });
}

function displayResults(list) {
    resultsContainer.innerHTML = '';
    if (list.length === 0) {
        resultsContainer.innerHTML = '<p class="text-muted p-3">Hittade inget som matchar din sökning...</p>';
    } else {
        list.forEach(m => {
            const item = document.createElement('a');
            item.href = m.url;
            item.className = 'search-result-item';
            item.innerHTML = `
                <img src="${m.img}" alt="${m.title}">
                <div>
                    <strong>${m.title}</strong><br>
                    <small>${m.time} • ${m.tags.join(', ')}</small>
                </div>
            `;
            resultsContainer.appendChild(item);
        });
    }
    resultsContainer.style.display = 'block';
}

//---- boombox ----
function initRadio() {
    const placeholder = document.getElementById('radio-placeholder');
    if (!placeholder) return;

    // 1. Hämta datan FRÅN placeholder-diven FÖRST
    const bgData = placeholder.getAttribute('data-bg');
    const cassetteData = placeholder.getAttribute('data-cassette');
    const titleData = placeholder.getAttribute('data-title');

    // 2. Hämta själva mallen
    fetch('../components/radio-template.html')
        .then(res => {
            if (!res.ok) throw new Error("Kunde inte hitta radio-template.html");
            return res.text();
        })
        .then(html => {
            // 3. Tryck in mallen i diven
            placeholder.innerHTML = html;

            // 4. Applicera datan på de nya elementen inuti mallen
            const bgImg = document.getElementById('radio-bg-img');
            const cassetteImg = document.getElementById('active-cassette');
            const radioTitle = document.getElementById('radio-title');

            if (bgImg) bgImg.src = bgData;
            if (cassetteImg) cassetteImg.src = cassetteData;
            if (radioTitle) radioTitle.innerText = titleData;
            
            console.log("Radio laddad med titeln:", titleData);
        })
        .catch(err => console.error("Radio-fel:", err));
}
//----bombox slut ---

// --- STARTA ALLT ---
document.addEventListener("DOMContentLoaded", () => {
    loadComponent('nav-placeholder', 'nav-template.html');
    loadComponent('footer-placeholder', 'footer-template.html');
    
    updateDynamicGreeting();
    updateMeditationHero();
    setTimeout(typeLoop, 1000);
});

setInterval(() => {
    updateDynamicGreeting();
    updateMeditationHero();
}, 1800000);