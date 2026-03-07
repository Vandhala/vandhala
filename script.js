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

// --- 2. DYNAMISK HÄLSNING, VÄDER OCH BILD ---

async function updateDynamicGreeting() {
    const now = new Date();
    const hours = now.getHours();
    const dayName = now.toLocaleDateString('sv-SE', { weekday: 'long' });
    
    // Element-referenser
    const greetingElement = document.getElementById('greeting-text');
    const heroImage = document.getElementById('hero-image');
    const heroTitle = document.getElementById('hero-title');

    // 1. Bestäm hälsning och bild baserat på tid
    let greeting = "Hej";
    let imageUrl = "images/dag.jpg"; 

    if (hours >= 5 && hours < 10) {
        greeting = "God morgon";
        imageUrl = "images/morgon.jpg";
    } else if (hours >= 10 && hours < 18) {
        greeting = "Hoppas du har en bra dag";
        imageUrl = "images/dag.jpg";
    } else if (hours >= 18 && hours < 23) {
        greeting = "God kväll";
        imageUrl = "images/kvall.jpg";
    } else {
        greeting = "God natt";
        imageUrl = "images/kvall.jpg";
    }

    if (heroImage) {
        heroImage.src = imageUrl;
    }

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=sv&appid=${apiKey}`);
        
        if (!response.ok) throw new Error("API-fel");
        
        const data = await response.json();
        const temp = Math.round(data.main.temp);
        const condition = data.weather[0].description; 

        const fullSentence = `Kul att du är här, Idag är en härlig ${dayName} att njuta av ${temp} grader och ${condition}!`;
        
        if (greetingElement) greetingElement.innerText = fullSentence;
        if (heroTitle) heroTitle.innerText = greeting + "!";

    } catch (error) {
        const fallback = `${greeting}, kul att du är här! Ha en fin ${dayName}!`;
        if (greetingElement) greetingElement.innerText = fallback;
        if (heroTitle) heroTitle.innerText = greeting + "!";
        console.log("Väder kunde inte hämtas:", error);
    }
}

// Starta direkt vid laddning
updateDynamicGreeting();
setInterval(updateDynamicGreeting, 1800000);

// --- 3. FIX FÖR MOBILMENY & LAMPA ---

// Vi letar efter Bootstrap-standard för menyknappar
const menuBtn = document.querySelector('.navbar-toggler'); 
const lampWrapper = document.querySelector('.toggle-scene'); // Huvudcontainern för lampan

if (menuBtn && lampWrapper) {
    menuBtn.addEventListener('click', () => {
        // Vi kollar om menyn håller på att öppnas (Bootstrap sätter ofta aria-expanded till true)
        const isOpening = menuBtn.getAttribute('aria-expanded') === 'false';
        
        if (isOpening) {
            // Göm lampan direkt så den inte stör krysset
            lampWrapper.style.opacity = '0';
            lampWrapper.style.pointerEvents = 'none';
        } else {
            // Visa lampan igen när menyn stängs
            setTimeout(() => {
                lampWrapper.style.opacity = '1';
                lampWrapper.style.pointerEvents = 'all';
            }, 300); // 300ms matchar oftast menyns animationstemp
        }
    });
}