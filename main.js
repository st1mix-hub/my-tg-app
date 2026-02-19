const tg = window.Telegram.WebApp;
tg.expand();

// ========== ОБЩИЕ ПЕРЕМЕННЫЕ ==========
let balance = 1000;
let spinning = false;
let bonusActive = false;
let currentBet = 10;

// Статистика
let gamesPlayed = 0;
let wins = 0;
let totalWon = 0;
let bestWin = 0;

// Символы для казино
const symbols = ['🍒', '🍋', '⭐', '💎', '7️⃣'];

// ========== DOM ЭЛЕМЕНТЫ (казино) ==========
const reel1 = document.getElementById('reel1');
const reel2 = document.getElementById('reel2');
const reel3 = document.getElementById('reel3');
const spinBtn = document.getElementById('spinBtn');
const betInput = document.getElementById('bet');
const balanceSpan = document.getElementById('balance');
const messageDiv = document.getElementById('message');
const bonusGame = document.getElementById('bonusGame');
const chests = document.querySelectorAll('.chest');
const quickBetBtns = document.querySelectorAll('.chip');

// ========== ЭЛЕМЕНТЫ ПРОФИЛЯ ==========
const usernameEl = document.getElementById('username');
const avatarEl = document.getElementById('avatar');
const gamesPlayedEl = document.getElementById('gamesPlayed');
const winsEl = document.getElementById('wins');
const winRateEl = document.getElementById('winRate');
const profileBalanceEl = document.getElementById('profileBalance');
const totalWonEl = document.getElementById('totalWon');
const bestWinEl = document.getElementById('bestWin');

// Достижения
const achFirst = document.getElementById('achFirstStatus');
const achTen = document.getElementById('achTenStatus');
const achHundred = document.getElementById('achHundredStatus');
const achJackpot = document.getElementById('achJackpotStatus');
const achRich = document.getElementById('achRichStatus');

// ========== ЭЛЕМЕНТЫ РАКЕТЫ ==========
const rocket = document.getElementById('rocket');
const multiplierDisplay = document.getElementById('multiplier');
const nextLaunchDiv = document.getElementById('nextLaunch');
const placeBetBtn = document.getElementById('placeBetBtn');
const cashoutBtn = document.getElementById('cashoutBtn');
const rocketBetInput = document.getElementById('rocketBet');
const activeBetDiv = document.getElementById('activeBet');
const currentBetAmount = document.getElementById('currentBetAmount');
const potentialWin = document.getElementById('potentialWin');
const crashHistory = document.getElementById('crashHistory');
const topMultiplierDisplay = document.getElementById('topMultiplier');
const rocketTotalWonDisplay = document.getElementById('rocketTotalWon');

// ========== ПЕРЕМЕННЫЕ РАКЕТЫ ==========
let rocketState = 'waiting'; // waiting, flying, crashed
let rocketInterval = null;
let timerInterval = null;
let currentMultiplier = 1.0;
let crashPoint = 0;
let nextLaunchTime = 0;
let activeRocketBet = null; // { amount: 10, multiplierAtBet: 1.0 }
let rocketTotalWon = 0;
let topMultiplier = 1.0;

// ========== TELEGRAM ДАННЫЕ ==========
if (tg.initDataUnsafe?.user) {
  const user = tg.initDataUnsafe.user;
  usernameEl.textContent = user.username ? `@${user.username}` : user.first_name;
  
  if (user.photo_url) {
    avatarEl.innerHTML = `<img src="${user.photo_url}" style="width:70px;height:70px;border-radius:50%;">`;
  }
}

// ========== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ==========
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    tab.classList.add('active');
    document.getElementById(`${tab
