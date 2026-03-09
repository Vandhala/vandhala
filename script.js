const { gsap } = window;
const HIT = document.querySelector('.toggle-scene__hit-spot');
const DUMMY_CORD = document.querySelector('.toggle-scene__dummy-cord line');
const ENDY = 380.5405;

// Din API-nyckel och stad
const apiKey = "36441c5d053784963f7d381aa8acd9a6";
const city = "Eskilstuna";

let lampIsOn = true; 

// --- 1. DRAG-FUNKTION FÖR LAMPAN ---
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
            
            const hint = document.getElementById('lamp-hint');
            if (hint) {
                hint.style.display = 'none';
            }
            
            updateDynamicGreeting(); 
        }
      }
    });
  }
});

// --- 2. DYNAMISK HÄLSNING, VÄDER, BILD OCH MEDITATION ---

async function updateDynamicGreeting() {
    const now = new Date();
    const hours = now.getHours();
    const dayName = now.toLocaleDateString('sv-SE', { weekday: 'long' });
    
    // Element-referenser (Hero)
    const greetingElement = document.getElementById('greeting-text');
    const heroImage = document.getElementById('hero-image');
    const heroTitle = document.getElementById('hero-title');

    // Element-referenser (Meditation-sektion) - UPPDATERAT ID HÄR FÖR ATT MATCHA NYA LAYOUTEN
    const medTitle = document.getElementById('meditation-title-top');
    const medText = document.getElementById('meditation-text');
    const medLink = document.getElementById('meditation-link');

    // 1. Bestäm hälsning och bild baserat på tid
    let greeting = "Hej";
    let imageUrl = "images/dag.jpg"; 

    if (hours >= 5 && hours < 10) {
        // MORGON
        greeting = "God morgon";
        imageUrl = "images/morgon.jpg";
        
        if(medTitle) medTitle.innerText = "Morgonmeditation";
        if(medText) medText.innerText = "Ge dig själv en bra start på dagen, det förtjänar du.";
        if(medLink) medLink.href = "morgon-meditation.html";

    } else if (hours >= 10 && hours < 18) {
        // DAG
        greeting = "Hoppas du har en bra dag";
        imageUrl = "images/dag.jpg";

        if(medTitle) medTitle.innerText = "Meditation";
        if(medText) medText.innerText = "Ta en paus under dagen och meditera, det förtjänar du.";
        if(medLink) medLink.href = "dag-meditation.html";

    } else {
        // KVÄLL/NATT
        greeting = (hours >= 18 && hours < 23) ? "God kväll" : "God natt";
        imageUrl = "images/kvall.jpg";

        if(medTitle) medTitle.innerText = "Kvällsmeditation";
        if(medText) medText.innerText = "Landa i dig själv och ge dig själv ett bra avslut på dagen, det förtjänar du.";
        if(medLink) medLink.href = "kvall-meditation.html";
    }

    // Uppdatera Hero-bilden
    if (heroImage) {
        heroImage.src = imageUrl;
    }

    // 2. Hämta väder från OpenWeather
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=sv&appid=${apiKey}`);
        
        if (!response.ok) throw new Error("API-fel");
        
        const data = await response.json();
        const temp = Math.round(data.main.temp);
        const condition = data.weather[0].description; 

        // 3. Bygg hela meningen för Hero-texten
        const fullSentence = `Kul att du är här, Idag är en härlig ${dayName} att njuta av ${temp} grader och ${condition}!`;
        
        if (greetingElement) greetingElement.innerText = fullSentence;
        if (heroTitle) heroTitle.innerText = greeting + "!";

    } catch (error) {
        // Fallback om vädret misslyckas
        const fallback = `${greeting}, kul att du är här! Ha en fin ${dayName}!`;
        if (greetingElement) greetingElement.innerText = fallback;
        if (heroTitle) heroTitle.innerText = greeting + "!";
        console.log("Väder kunde inte hämtas:", error);
    }
}

// Starta direkt vid laddning
updateDynamicGreeting();

// Uppdatera var 30:e minut
setInterval(updateDynamicGreeting, 1800000);

// bil och pratbubbla

const textTarget = document.getElementById("typing-text");
const message = "nu startar din inre resa, vill du veta vem som sitter bredvid dig i passagerarsätet? läs mer om vandhala!";
let i = 0;

function typeWriter() {
    if (i < message.length) {
        textTarget.innerHTML += message.charAt(i);
        i++;
        setTimeout(typeWriter, 50); // Justera hastighet här
    }
}

// Starta animationen
document.addEventListener("DOMContentLoaded", typeWriter);