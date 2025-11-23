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
    
    // Calculate percentages based on 800px container width
    const containerWidth = 800;
    const whiteBoxPercent = (settings.whiteSize / containerWidth) * 100;
    const yellowBoxPercent = (settings.yellowSize / containerWidth) * 100;
    
    WHITE_BOX_START = 35;
    WHITE_BOX_END = WHITE_BOX_START + whiteBoxPercent;
    
    const yellowCenter = WHITE_BOX_START + (whiteBoxPercent / 2);
    YELLOW_BOX_START = yellowCenter - (yellowBoxPercent / 2);
    YELLOW_BOX_END = yellowCenter + (yellowBoxPercent / 2);
    
    GOOD_PROGRESS = settings.goodProgress;
    GREAT_PROGRESS = settings.greatProgress;
    
    // Hide star selection and show game
    document.getElementById('starSelection').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
}

// Create buzzer sound
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

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
        status.textContent = 'Press \'E\' to activate';
    }
}

function startSkillcheck() {
    isSkillcheckActive = true;
    redLinePosition = 0;
    redLine.style.left = '0%';
    machineArea.style.display = 'block';
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
    const inYellowBox = redLinePosition >= YELLOW_BOX_START && redLinePosition <= YELLOW_BOX_END;
    const inWhiteBox = redLinePosition >= WHITE_BOX_START && redLinePosition <= WHITE_BOX_END;
    
    if (inYellowBox) {
        // Perfect hit! Great progress
        addProgress(GREAT_PROGRESS);
        status.textContent = 'Great!';
        status.style.color = '#FFD700';
    } else if (inWhiteBox) {
        // Good hit, normal progress
        addProgress(GOOD_PROGRESS);
        status.textContent = 'Good';
        status.style.color = '#4CAF50';
    } else {
        // Miss
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
}
