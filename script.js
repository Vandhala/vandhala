const { gsap } = window;

// --- 0. HÄMTA SPARAT TEMA ---
let savedTheme = localStorage.getItem('theme') || 'light';
let lampIsOn = savedTheme === 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// --- 1. KOMPONENT-LADDARE (Förenklad för att hitta nav/footer) ---
async function loadComponent(elementId, fileName) {
    const el = document.getElementById(elementId);
    if (!el) return;

    try {
        const response = await fetch(fileName);
        if (!response.ok) throw new Error(`Kunde inte hitta: ${fileName}`);
        
        const data = await response.text();
        el.innerHTML = data;
        
        if (elementId === 'nav-placeholder') {
            if (typeof initializeLamp === 'function') initializeLamp();
            
            // Fixa aktiv länk
            const currentPath = window.location.pathname;
            document.querySelectorAll('.nav-link').forEach(link => {
                if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href').replace('.html', ''))) {
                    link.classList.add('active');
                }
            });
        }

        if (elementId === 'footer-placeholder') {
            updateFooterQuote();
        }
    } catch (error) {
        console.warn("Laddningsfel:", error);
    }
}

// --- 2. LAMP-LOGIK ---
function initializeLamp() {
    const HIT = document.querySelector('.toggle-scene__hit-spot');
    const DUMMY_CORD = document.querySelector('.toggle-scene__dummy-cord line');
    const ENDY = 380.5405;
    const lampHint = document.getElementById('lamp-hint');

    if (!HIT || !DUMMY_CORD) return;

    const hasUsedLamp = localStorage.getItem('hasUsedLamp') === 'true';
    if (hasUsedLamp && lampHint) {
        lampHint.style.display = 'none';
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
                        localStorage.setItem('hasUsedLamp', 'true');
                        if (lampHint) lampHint.style.display = 'none';
                        updateDynamicGreeting(); 
                        updateMeditationHero();
                    }
                }
            });
        }
    });
}

// --- 3. DYNAMISK HÄLSNING (Startsidan) ---
function updateDynamicGreeting() {
    const greetingElement = document.getElementById('greeting-text');
    const heroImage = document.getElementById('hero-image');
    const heroTitle = document.getElementById('hero-title');
    
    if (!greetingElement && !heroImage && !heroTitle) return;

    const now = new Date();
    const hours = now.getHours();
    const dayName = now.toLocaleDateString('sv-SE', { weekday: 'long' }).toLowerCase();
    
    const dailyExercises = {
        "måndag": "Måndag är en bra dag för att sätta en intention...",
        "tisdag": "Tisdag handlar om riktning...",
        "onsdag": "Onsdag är veckans mittpunkt...",
        "torsdag": "Torsdag är en dag för reflektion...",
        "fredag": "Fredag är tiden för att rensa...",
        "lördag": "Lördag är en dag för att bara vara...",
        "söndag": "Söndag, kom ihåg att varva ner helt..."
    };

    let greeting = "Hej";
    let imageUrl = "images/dag.jpg"; 

    if (hours >= 5 && hours < 10) { greeting = "God morgon"; imageUrl = "images/morgon.jpg"; }
    else if (hours >= 10 && hours < 18) { greeting = "Hoppas du har en bra dag"; imageUrl = "images/dag.jpg"; }
    else { greeting = "God kväll"; imageUrl = "images/kvall.jpg"; }

    if (heroImage) heroImage.src = imageUrl;
    if (heroTitle) heroTitle.innerText = greeting + "!";
    if (greetingElement) greetingElement.innerText = dailyExercises[dayName] || `Ha en fin ${dayName}!`;
}

// --- 4. DYNAMISK HERO ---
function updateMeditationHero() {
    const glassTitle = document.getElementById('dynamic-glass-title') || document.getElementById('meditation-title-top');
    const glassText = document.getElementById('dynamic-glass-text') || document.getElementById('meditation-text');
    const sideImg = document.getElementById('meditation-side-img');

    const hours = new Date().getHours();
    if (!glassTitle) return;

    if (hours >= 5 && hours < 10) {
        glassTitle.innerText = "Morgonmeditation";
        if(glassText) glassText.innerText = "Starta dagen med harmoni...";
    } else if (hours >= 10 && hours < 18) {
        glassTitle.innerText = "Dagsmeditation";
        if(glassText) glassText.innerText = "Hitta fokus mitt i vardagen...";
    } else {
        glassTitle.innerText = "Kvällsmeditation";
        if(glassText) glassText.innerText = "Landa i stillhet inför natten...";
    }
}

// --- 5. SLUMPVALT CITAT ---
function updateFooterQuote() {
    const quotes = ["Ditt lugn är din superkraft.", "Andetaget förenar kropp och själ."];
    const el = document.getElementById('footer-quote');
    if (el) el.innerText = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;
}

// --- 6. TYPEWRITER (Bilen) ---
const textTarget = document.getElementById("typing-text");
const fullText = "Nu startar din inre resa, vill du veta mer vem som sitter bredvid dig i passagerarsätet? Läs mer om vandhala!";
let isDeleting = false;
let currentText = "";

function typeLoop() {
    if (!textTarget) return;
    currentText = isDeleting ? fullText.substring(0, currentText.length - 1) : fullText.substring(0, currentText.length + 1);
    textTarget.innerHTML = currentText;
    let typeSpeed = isDeleting ? 30 : 60;
    if (!isDeleting && currentText === fullText) { typeSpeed = 3000; isDeleting = true; }
    else if (isDeleting && currentText === "") { isDeleting = false; typeSpeed = 500; }
    setTimeout(typeLoop, typeSpeed);
}

// --- 7. MODERN RADIO ---
// ---- Radio (Rättad efter din mappbild) ----
function initRadio() {
    const placeholder = document.getElementById('radio-placeholder');
    if (!placeholder) return;

    const audioPath = placeholder.getAttribute('data-audio');
    const title = placeholder.getAttribute('data-title');
    const audio = new Audio(audioPath);
    
    // Kollar om vi är i mappen 'meditations-bibliotek'
    const isSubPage = window.location.pathname.includes('meditations-bibliotek');
    
    // Om vi är i en undermapp: gå ut ett steg (../) sen in i components/
    // Om vi är på index: gå direkt in i components/
    const templatePath = isSubPage 
        ? '../components/radio-template.html' 
        : 'components/radio-template.html';

    fetch(templatePath)
        .then(res => {
            if (!res.ok) throw new Error("Hittade inte mallen på: " + templatePath);
            return res.text();
        })
        .then(html => {
            placeholder.innerHTML = html;
            
            const btn = document.getElementById('button');
            const arm = document.getElementById('arm-group');
            const disk = document.getElementById('disk');
            const icon = document.getElementById('play-icon');

            if (!btn) return;

            btn.onclick = () => {
                if (audio.paused) {
                    // Starta spelaren
                    if(arm) arm.style.transform = "rotate(22deg)";
                    setTimeout(() => {
                        audio.play();
                        if(disk) disk.style.animationPlayState = "running";
                        if(icon) icon.className = "bi bi-pause-fill";
                        const displayTitle = document.getElementById('display-title');
                        if(displayTitle) displayTitle.innerText = title.toUpperCase();
                    }, 1000);
                } else {
                    // Pausa spelaren
                    audio.pause();
                    if(disk) disk.style.animationPlayState = "paused";
                    if(arm) arm.style.transform = "rotate(0deg)";
                    if(icon) icon.className = "bi bi-play-fill";
                }
            };

            // Uppdatera tid och slider (om de finns)
            audio.ontimeupdate = () => {
                const curTimeText = document.getElementById('current-time');
                const slider = document.getElementById('seek-slider');
                if(slider) slider.value = audio.currentTime;
                if(curTimeText) curTimeText.innerText = formatTime(audio.currentTime);
            };
            
            audio.onloadedmetadata = () => {
                const slider = document.getElementById('seek-slider');
                const durTimeText = document.getElementById('total-duration');
                if(slider) slider.max = audio.duration;
                if(durTimeText) durTimeText.innerText = formatTime(audio.duration);
            };
        })
        .catch(err => console.error("Radio-fel:", err));
}