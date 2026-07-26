// --- Firebase Setup ---
// Add this to your HTML <head> before script.js:
// <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"></script>

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAo2NVWVmwXriwoXxzQ9kic66oaSLHqR9U",
  authDomain: "cookies-55555.firebaseapp.com",
  projectId: "cookies-55555",
  storageBucket: "cookies-55555.appspot.com",
  messagingSenderId: "243423799460",
  appId: "1:243423799460:web:05f6fc62b34073a1f15e31",
  measurementId: "G-ZH0C180YWJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// --- Auth UI Elements ---
const googleSignInBtn = document.getElementById('googleSignInBtn');
const authStatus = document.getElementById('authStatus');

googleSignInBtn.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      authStatus.textContent = 'Signed in as: ' + result.user.displayName;
    })
    .catch((error) => {
      authStatus.textContent = 'Sign in unavailable in this browser.';
    });
});

auth.onAuthStateChanged((user) => {
  if (user) {
    authStatus.textContent = 'Signed in as: ' + user.email;
  } else {
    authStatus.textContent = '';
  }
});

// Hide auth status text on page load since Firebase needs a web server
authStatus.textContent = '';

let score = 0;
let autoClickers = 0;
let grandmas = 0;
let factories = 0;
let mines = 0;
let banks = 0;
let portals = 0;

let autoClickerCost = 15;
let grandmaCost = 80;
let factoryCost = 400;
let mineCost = 2000;
let bankCost = 10000;
let portalCost = 50000;

// Upgrades
let silverFingerCount = 0;
let silverFingerCost = 100;
let goldenClickerCount = 0;
let goldenClickerCost = 500;
let cookieStormCount = 0;
let cookieStormCost = 2500;

const scoreEl = document.getElementById('score');
const cookieEl = document.getElementById('cookie');
const autoClickerBtn = document.getElementById('autoClickerBtn');
const autoClickerCostEl = document.getElementById('autoClickerCost');
const autoClickerCountEl = document.getElementById('autoClickerCount');
const grandmaBtn = document.getElementById('grandmaBtn');
const grandmaCostEl = document.getElementById('grandmaCost');
const grandmaCountEl = document.getElementById('grandmaCount');
const factoryBtn = document.getElementById('factoryBtn');
const factoryCostEl = document.getElementById('factoryCost');
const factoryCountEl = document.getElementById('factoryCount');
const mineBtn = document.getElementById('mineBtn');
const mineCostEl = document.getElementById('mineCost');
const mineCountEl = document.getElementById('mineCount');
const bankBtn = document.getElementById('bankBtn');
const bankCostEl = document.getElementById('bankCost');
const bankCountEl = document.getElementById('bankCount');
const portalBtn = document.getElementById('portalBtn');
const portalCostEl = document.getElementById('portalCost');
const portalCountEl = document.getElementById('portalCount');

// Upgrade buttons and counters
const silverFingerBtn = document.getElementById('cursorUpgradeBtn');
const silverFingerCostEl = document.getElementById('cursorUpgradeCost');
const silverFingerCountEl = document.getElementById('cursorUpgradeCount');
const goldenClickerBtn = document.getElementById('goldenFingerBtn');
const goldenClickerCostEl = document.getElementById('goldenFingerCost');
const goldenClickerCountEl = document.getElementById('goldenFingerCount');
const cookieStormBtn = document.getElementById('cookieStormBtn');
const cookieStormCostEl = document.getElementById('cookieStormCost');
const cookieStormCountEl = document.getElementById('cookieStormCount');

function updateUI() {
    scoreEl.textContent = score;
    autoClickerCostEl.textContent = autoClickerCost;
    autoClickerCountEl.textContent = autoClickers;
    autoClickerBtn.disabled = score < autoClickerCost;
    grandmaCostEl.textContent = grandmaCost;
    grandmaCountEl.textContent = grandmas;
    grandmaBtn.disabled = score < grandmaCost;
    factoryCostEl.textContent = factoryCost;
    factoryCountEl.textContent = factories;
    factoryBtn.disabled = score < factoryCost;
    mineCostEl.textContent = mineCost;
    mineCountEl.textContent = mines;
    mineBtn.disabled = score < mineCost;
    bankCostEl.textContent = bankCost;
    bankCountEl.textContent = banks;
    bankBtn.disabled = score < bankCost;
    portalCostEl.textContent = portalCost;
    portalCountEl.textContent = portals;
    portalBtn.disabled = score < portalCost;
    // Upgrades
    silverFingerCostEl.textContent = silverFingerCost;
    silverFingerCountEl.textContent = silverFingerCount;
    silverFingerBtn.disabled = score < silverFingerCost;
    goldenClickerCostEl.textContent = goldenClickerCost;
    goldenClickerCountEl.textContent = goldenClickerCount;
    goldenClickerBtn.disabled = score < goldenClickerCost;
    cookieStormCostEl.textContent = cookieStormCost;
    cookieStormCountEl.textContent = cookieStormCount;
    cookieStormBtn.disabled = score < cookieStormCost;
}

function getClickValue() {
    let value = 1;
    if (silverFingerCount > 0) value *= Math.pow(2, silverFingerCount);
    if (goldenClickerCount > 0) value *= Math.pow(3, goldenClickerCount);
    if (cookieStormCount > 0) value *= Math.pow(5, cookieStormCount);
    return value;
}

cookieEl.addEventListener('click', () => {
    score += getClickValue();
    updateUI();
});

silverFingerBtn.addEventListener('click', () => {
    if (score >= silverFingerCost) {
        score -= silverFingerCost;
        silverFingerCount++;
        silverFingerCost = Math.floor(silverFingerCost * 2);
        updateUI();
    }
});

goldenClickerBtn.addEventListener('click', () => {
    if (score >= goldenClickerCost) {
        score -= goldenClickerCost;
        goldenClickerCount++;
        goldenClickerCost = Math.floor(goldenClickerCost * 2.2);
        updateUI();
    }
});

cookieStormBtn.addEventListener('click', () => {
    if (score >= cookieStormCost) {
        score -= cookieStormCost;
        cookieStormCount++;
        cookieStormCost = Math.floor(cookieStormCost * 2.5);
        updateUI();
    }
});

autoClickerBtn.addEventListener('click', () => {
    if (score >= autoClickerCost) {
        score -= autoClickerCost;
        autoClickers++;
        autoClickerCost = Math.floor(autoClickerCost * 1.25);
        updateUI();
    }
});

grandmaBtn.addEventListener('click', () => {
    if (score >= grandmaCost) {
        score -= grandmaCost;
        grandmas++;
        grandmaCost = Math.floor(grandmaCost * 1.3);
        updateUI();
    }
});

factoryBtn.addEventListener('click', () => {
    if (score >= factoryCost) {
        score -= factoryCost;
        factories++;
        factoryCost = Math.floor(factoryCost * 1.35);
        updateUI();
    }
});

mineBtn.addEventListener('click', () => {
    if (score >= mineCost) {
        score -= mineCost;
        mines++;
        mineCost = Math.floor(mineCost * 1.4);
        updateUI();
    }
});

bankBtn.addEventListener('click', () => {
    if (score >= bankCost) {
        score -= bankCost;
        banks++;
        bankCost = Math.floor(bankCost * 1.45);
        updateUI();
    }
});

portalBtn.addEventListener('click', () => {
    if (score >= portalCost) {
        score -= portalCost;
        portals++;
        portalCost = Math.floor(portalCost * 1.5);
        updateUI();
    }
});

setInterval(() => {
    let cps = autoClickers + (grandmas * 5) + (factories * 20) + (mines * 100) + (banks * 500) + (portals * 2000);
    if (cps > 0) {
        score += cps;
        updateUI();
    }
}, 1000);

updateUI();
