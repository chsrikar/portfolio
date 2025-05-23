// Loading Screen
const loadingScreen = document.getElementById('loading-screen');
const startScreen = document.getElementById('start-screen');

// Handle loading screen
function handleLoadingScreen() {
    // Loading screen will automatically progress through animations
    // After 6 seconds (when progress bar is full), wait for key press
    setTimeout(() => {
        const handleKeyPress = () => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                document.removeEventListener('keypress', handleKeyPress);
            }, 500);
        };
        document.addEventListener('keypress', handleKeyPress);
    }, 6000);
}

// Initialize loading screen
window.addEventListener('load', () => {
    handleLoadingScreen();
});

// DOM Elements
const mainContent = document.querySelector('main');
const startBtn = document.getElementById('start-btn');
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const skillBars = document.querySelectorAll('.fill');
const soundToggle = document.querySelector('.sound-toggle');

// Audio Setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const sounds = {
    click: null,
    background: null,
    powerUp: null
};

// Konami Code
let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

// Create retro sound
function createRetroSound(type) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    switch(type) {
        case 'click':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            break;
        case 'powerUp':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            break;
    }

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    return { oscillator, gainNode };
}

// Play sound
function playSound(type) {
    if (soundToggle.textContent === '🔊') {
        const sound = createRetroSound(type);
        sound.oscillator.start();
        sound.oscillator.stop(audioContext.currentTime + 0.2);
    }
}

// Initialize skill bars
function initializeSkillBars() {
    skillBars.forEach(bar => {
        const level = bar.getAttribute('data-level');
        gsap.to(bar, {
            width: `${level}%`,
            duration: 1,
            ease: 'power2.out'
        });
    });
}

// Section transitions
function showSection(sectionId) {
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Animate section elements
        gsap.from(targetSection.children, {
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out'
        });

        if (sectionId === 'stats') {
            initializeSkillBars();
        }
    }
}

// Start game transition
startBtn.addEventListener('click', () => {
    playSound('powerUp');
    
    gsap.to(startScreen, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            startScreen.classList.remove('active-section');
            startScreen.style.display = 'none';
            mainContent.classList.remove('hidden');
            
            gsap.from(mainContent, {
                opacity: 0,
                duration: 0.5
            });
            
            showSection('stats');
        }
    });
});

// Navigation
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        playSound('click');
        showSection(btn.getAttribute('data-section'));
    });
});

// Sound toggle
soundToggle.addEventListener('click', () => {
    soundToggle.textContent = soundToggle.textContent === '🔊' ? '🔈' : '🔊';
});

// Game Variables
let gameScore = 0;
let gameLevel = 1;
let playerX = 50; // horizontal percentage
let playerY = 80; // vertical percentage
let gameActive = false;

// Game Functions
function movePlayer(direction) {
    if (!gameActive) return;
    
    const step = 10;
    const player = document.getElementById('player');
    
    switch(direction) {
        case 'left':
            if (playerX > 10) playerX -= step;
            break;
        case 'right':
            if (playerX < 90) playerX += step;
            break;
        case 'up':
            if (playerY > 10) playerY -= step;
            break;
        case 'down':
            if (playerY < 90) playerY += step;
            break;
    }
    
    player.style.left = `${playerX}%`;
    player.style.top = `${playerY}%`;
    checkCollisions();
}

function checkCollisions() {
    const player = document.getElementById('player');
    const collectibles = document.querySelectorAll('.collectible');
    const playerRect = player.getBoundingClientRect();
    
    collectibles.forEach(collectible => {
        const collectibleRect = collectible.getBoundingClientRect();
        if (isColliding(playerRect, collectibleRect)) {
            collectItem(collectible);
        }
    });
}

function isColliding(rect1, rect2) {
    return !(rect1.right < rect2.left || 
            rect1.left > rect2.right || 
            rect1.bottom < rect2.top || 
            rect1.top > rect2.bottom);
}

function collectItem(item) {
    playSound('powerUp');
    gameScore += 100;
    document.getElementById('game-score').textContent = gameScore;
    
    if (gameScore % 300 === 0) {
        gameLevel++;
        document.getElementById('game-level').textContent = gameLevel;
    }
    
    // Respawn collectible in new position
    const randomTop = Math.random() * 60 + 10;
    const randomLeft = Math.random() * 60 + 20;
    item.style.top = `${randomTop}%`;
    item.style.left = `${randomLeft}%`;
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (gameActive) {
        switch(e.key) {
            case 'ArrowLeft':
                movePlayer('left');
                break;
            case 'ArrowRight':
                movePlayer('right');
                break;
            case 'ArrowUp':
                movePlayer('up');
                break;
            case 'ArrowDown':
                movePlayer('down');
                break;
        }
    }
});

// Konami code detection
document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        
        if (konamiIndex === konamiCode.length) {
            playSound('powerUp');
            document.getElementById('easter-egg').classList.remove('hidden');
            gameActive = true;
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

// Close easter egg when clicking outside
document.addEventListener('click', (e) => {
    const easterEgg = document.getElementById('easter-egg');
    if (!easterEgg.classList.contains('hidden') && !easterEgg.contains(e.target)) {
        easterEgg.classList.add('hidden');
    }
});

// Form submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        playSound('powerUp');
        
        // Add your form submission logic here
        alert('Message sent! (Demo only)');
        contactForm.reset();
    });
}

// Initialize glitch effect
function initGlitch() {
    setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance of glitch
            document.body.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
            setTimeout(() => {
                document.body.style.transform = 'none';
            }, 50);
        }
    }, 2000);
}

// Initialize
window.addEventListener('load', () => {
    initGlitch();
});
