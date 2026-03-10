const { gsap } = window;
const HIT = document.querySelector('.toggle-scene__hit-spot');
const DUMMY_CORD = document.querySelector('.toggle-scene__dummy-cord line');
const ENDY = 380.5405;

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

// --- 2. DYNAMISK HÄLSNING & DAGLIG ÖVNING ---
function updateDynamicGreeting() {
    const now = new Date();
    const hours = now.getHours();
    const dayName = now.toLocaleDateString('sv-SE', { weekday: 'long' });
    
    const dailyExercises = {
        "måndag": "Måndag är en bra dag för att sätta en intention. Vad vill du bjuda in i ditt liv under de kommande sju dagarna?",
        "tisdag": "Tisdag handlar om riktning. Ta ett djupt andetag och låt din energi flöda mot det som faktiskt betyder något för dig.",
        "onsdag": "Onsdag är veckans mittpunkt. Stanna upp en stund och känn efter: vad behöver du just nu för att hitta din inre jämvikt?",
        "torsdag": "Torsdag är en dag för reflektion. Se dig omkring och nämn tre små saker som du är tacksam för i detta nu.",
        "fredag": "Fredag är tiden för att rensa. Andas ut veckans stress och gör plats för den stillhet som väntar under helgen.",
        "lördag": "Lördag är en dag för att bara vara. Tillåt dig själv att utforska din inre värld utan krav på prestation eller mål.",
        "söndag": "Söndag, kom ihåg att varva ner helt. Låt själen hinna ikapp och ladda dina batterier inför en ny cykel."
    };

    const greetingElement = document.getElementById('greeting-text');
    const heroImage = document.getElementById('hero-image');
    const heroTitle = document.getElementById('hero-title');
    const medTitle = document.getElementById('meditation-title-top');
    const medText = document.getElementById('meditation-text');
    const medLink = document.getElementById('meditation-link');

    let greeting = "Hej";
    let imageUrl = "images/dag.jpg"; 

    if (hours >= 5 && hours < 10) {
        greeting = "God morgon";
        imageUrl = "images/morgon.jpg";
        if(medTitle) medTitle.innerText = "Morgonmeditation";
        if(medText) medText.innerText = "Ge dig själv en bra start på dagen, det förtjänar du.";
        if(medLink) medLink.href = "morgon-meditation.html";
    } else if (hours >= 10 && hours < 18) {
        greeting = "Hoppas du har en bra dag";
        imageUrl = "images/dag.jpg";
        if(medTitle) medTitle.innerText = "Meditation";
        if(medText) medText.innerText = "Ta en paus under dagen och meditera, det förtjänar du.";
        if(medLink) medLink.href = "dag-meditation.html";
    } else {
        greeting = (hours >= 18 && hours < 23) ? "God kväll" : "God natt";
        imageUrl = "images/kvall.jpg";
        if(medTitle) medTitle.innerText = "Kvällsmeditation";
        if(medText) medText.innerText = "Landa i dig själv och ge dig själv ett bra avslut på dagen, det förtjänar du.";
        if(medLink) medLink.href = "kvall-meditation.html";
    }

    if (heroImage) heroImage.src = imageUrl;
    if (heroTitle) heroTitle.innerText = greeting + "!";
    
    // Sätt det dagliga budskapet
    if (greetingElement) {
        greetingElement.innerText = dailyExercises[dayName.toLowerCase()] || `Ha en fin ${dayName}!`;
    }
}

updateDynamicGreeting();
setInterval(updateDynamicGreeting, 1800000);

// --- 3. BIL OCH PRATBUBBLA (LOOPING) ---
const textTarget = document.getElementById("typing-text");
const fullText = "nu startar din inre resa, vill du veta vem som sitter bredvid dig i passagerarsätet? läs mer om vandhala!";

let isDeleting = false;
let currentText = "";
let speed = 60;

function typeLoop() {
    if (!textTarget) return;
    if (isDeleting) {
        currentText = fullText.substring(0, currentText.length - 1);
        speed = 30;
    } else {
        currentText = fullText.substring(0, currentText.length + 1);
        speed = 60; 
    }
    textTarget.innerHTML = currentText;
    if (!isDeleting && currentText === fullText) {
        speed = 3000; 
        isDeleting = true;
    } else if (isDeleting && currentText === "") {
        isDeleting = false;
        speed = 500;
    }
    setTimeout(typeLoop, speed);
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(typeLoop, 1000);
});