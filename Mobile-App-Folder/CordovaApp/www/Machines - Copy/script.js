const machine = document.getElementById('machine');
const machineArea = document.getElementById('machineArea');
const redLine = document.getElementById('redLine');
const progressFill = document.getElementById('progressFill');
const status = document.getElementById('status');
const whiteBox = document.getElementById('whiteBox');
const yellowBox = document.getElementById('yellowBox');

let isActive = false;
let progress = 0;
let redLinePosition = 0;
let animationId = null;
let isCompleted = false;
let skillcheckInterval = null;
let isSkillcheckActive = false;
let selectedStars = 0;

// Star difficulty settings
const starSettings = {
    1: { whiteSize: 180, yellowSize: 60, goodProgress: 5, greatProgress: 15 },
    2: { whiteSize: 150, yellowSize: 50, goodProgress: 7, greatProgress: 21 },
    3: { whiteSize: 120, yellowSize: 40, goodProgress: 11.11, greatProgress: 33.33 },
    4: { whiteSize: 90, yellowSize: 30, goodProgress: 14, greatProgress: 42 },
    5: { whiteSize: 60, yellowSize: 20, goodProgress: 20, greatProgress: 60 }
};

// Machine dimensions (percentages) - will be set based on star selection
let WHITE_BOX_START = 35;
let WHITE_BOX_END = 61;
let YELLOW_BOX_START = 44;
let YELLOW_BOX_END = 52;
let GOOD_PROGRESS = 11.11;
let GREAT_PROGRESS = 33.33;

function selectStars(stars) {
    selectedStars = stars;
    const settings = starSettings[stars];

    // Update box sizes - keep height at 40px (3-star height), only change width
    whiteBox.style.width = settings.whiteSize + 'px';
    whiteBox.style.height = '40px';
    yellowBox.style.width = settings.yellowSize + 'px';
    yellowBox.style.height = '40px';

    // Show game so layout measurements are accurate
    document.getElementById('starSelection').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';

    // Measure on next animation frame to ensure styles/layout applied
    requestAnimationFrame(() => {
        const containerRect = machineArea.getBoundingClientRect();
        const whiteRect = whiteBox.getBoundingClientRect();
        const yellowRect = yellowBox.getBoundingClientRect();

        const containerWidth = containerRect.width || 800;

        // Convert pixel bounds to percentages relative to the machine area
        WHITE_BOX_START = ((whiteRect.left - containerRect.left) / containerWidth) * 100;
        WHITE_BOX_END = ((whiteRect.right - containerRect.left) / containerWidth) * 100;

        YELLOW_BOX_START = ((yellowRect.left - containerRect.left) / containerWidth) * 100;
        YELLOW_BOX_END = ((yellowRect.right - containerRect.left) / containerWidth) * 100;

        GOOD_PROGRESS = settings.goodProgress;
        GREAT_PROGRESS = settings.greatProgress;

        // Debug info
        console.log('Container width:', containerWidth);
        console.log('White Box %:', WHITE_BOX_START, '-', WHITE_BOX_END);
        console.log('Yellow Box %:', YELLOW_BOX_START, '-', YELLOW_BOX_END);
    });
}

// Create buzzer sound
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Woohoo sound - kid yelling
const woohooSound = new Audio('homer-woohoo.mp3');
woohooSound.volume = 0.5;

function playBuzzer() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 200; // Low frequency for buzzer
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playWoohoo() {
    // Play kid woohoo sound
    woohooSound.currentTime = 0;
    woohooSound.play().catch(e => console.log('Audio play failed:', e));
}

// Listen for 'E' key to activate machine
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'e' && !isActive && !isCompleted) {
        activateMachine();
    } else if (e.key === ' ' && isActive && isSkillcheckActive) {
        e.preventDefault();
        checkTiming();
    }
});

function activateMachine() {
    isActive = true;
    machine.classList.remove('inactive');
    
    // Hide the activate button
    const activateBtn = document.getElementById('activateBtn');
    if (activateBtn) {
        activateBtn.style.display = 'none';
    }
    status.textContent = '';
    
    // Start skillcheck cycle every 5 seconds
    skillcheckInterval = setInterval(() => {
        if (isActive && !isCompleted) {
            startSkillcheck();
        }
    }, 5000);
    
    // Start first skillcheck after 5 seconds
    setTimeout(() => {
        if (isActive && !isCompleted) {
            startSkillcheck();
        }
    }, 5000);
}

function deactivateMachine() {
    isActive = false;
    machineArea.style.display = 'none';
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (skillcheckInterval) {
        clearInterval(skillcheckInterval);
        skillcheckInterval = null;
    }
    isSkillcheckActive = false;
    redLinePosition = 0;
    redLine.style.left = '0%';
    
    if (!isCompleted) {
        const activateBtn = document.getElementById('activateBtn');
        if (activateBtn) {
            activateBtn.style.display = 'inline-block';
        }
        status.textContent = '';
    }
}

function startSkillcheck() {
    isSkillcheckActive = true;
    redLinePosition = 0;
    redLine.style.left = '0%';
    machineArea.style.display = 'block';
    
    // Show skillcheck button
    const skillcheckBtn = document.getElementById('skillcheckBtn');
    if (skillcheckBtn) {
        skillcheckBtn.style.display = 'inline-block';
    }
    
    status.textContent = 'SKILLCHECK! Press SPACE!';
    startRedLineAnimation();
}

function startRedLineAnimation() {
    const speed = 0.5; // percentage per frame
    
    function animate() {
        if (!isActive || !isSkillcheckActive) return;
        
        redLinePosition += speed;
        
        if (redLinePosition >= 100) {
            // Red line completed one pass - skillcheck failed
            endSkillcheck(true);
            return;
        }
        
        redLine.style.left = redLinePosition + '%';
        animationId = requestAnimationFrame(animate);
    }
    
    animate();
}

function endSkillcheck(immediate = false) {
    isSkillcheckActive = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Hide skillcheck button
    const skillcheckBtn = document.getElementById('skillcheckBtn');
    if (skillcheckBtn) {
        skillcheckBtn.style.display = 'none';
    }
    
    // Delay hiding the machine area so the feedback text is visible
    if (!immediate) {
        setTimeout(() => {
            machineArea.style.display = 'none';
        }, 1000);
    } else {
        machineArea.style.display = 'none';
    }
    
    redLinePosition = 0;
    redLine.style.left = '0%';
}

function checkTiming() {
    if (!isSkillcheckActive) return;

    // Compute pixel-based collision using element bounding rects
    const containerRect = machineArea.getBoundingClientRect();
    const redRect = redLine.getBoundingClientRect();
    const whiteRect = whiteBox.getBoundingClientRect();
    const yellowRect = yellowBox.getBoundingClientRect();

    // Use red line center for collision
    const redCenter = redRect.left + (redRect.width / 2);

    const inWhiteBox = redCenter >= whiteRect.left && redCenter <= whiteRect.right;
    const inYellowBox = redCenter >= yellowRect.left && redCenter <= yellowRect.right;

    console.log('Red center(px):', redCenter);
    console.log('White(px):', whiteRect.left, '-', whiteRect.right, 'Yellow(px):', yellowRect.left, '-', yellowRect.right);

    if (inWhiteBox) {
        if (inYellowBox) {
            // Perfect hit in yellow box - Great progress
            playWoohoo();
            addProgress(GREAT_PROGRESS);
            status.textContent = 'Great!';
            status.style.color = '#FFD700';
        } else {
            // Good hit in white box (but not yellow) - normal progress
            addProgress(GOOD_PROGRESS);
            status.textContent = 'Good';
            status.style.color = '#4CAF50';
        }
    } else {
        // Miss - outside white box
        playBuzzer();
        status.textContent = 'Miss';
        status.style.color = '#ff6b6b';
    }
    
    endSkillcheck();
    
    setTimeout(() => {
        if (isActive && !isCompleted && !isSkillcheckActive) {
            status.textContent = '';
            status.style.color = 'white';
        }
    }, 1000);
}

function addProgress(amount) {
    progress += amount;
    if (progress >= 100) {
        progress = 100;
        completeMachine();
    }
    updateProgressBar();
}

function updateProgressBar() {
    progressFill.style.width = progress + '%';
    if (progress > 0) {
        progressFill.textContent = Math.round(progress) + '%';
    } else {
        progressFill.textContent = '';
    }
}

function completeMachine() {
    isCompleted = true;
    deactivateMachine();
    status.textContent = 'MACHINE COMPLETED! 🎉';
    status.style.color = '#4CAF50';
    status.style.fontSize = '28px';
    machine.style.border = '3px solid #4CAF50';
    
    // Add home button after completion
    const homeBtn = document.createElement('button');
    homeBtn.className = 'home-button';
    homeBtn.textContent = 'Home';
    homeBtn.onclick = () => window.location.href = '../index.html';
    homeBtn.style.marginTop = '20px';
    machine.appendChild(homeBtn);
}
