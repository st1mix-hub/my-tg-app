const tg = window.Telegram.WebApp;
tg.expand();

// ========== ОБЩИЕ ПЕРЕМЕННЫЕ ==========
let balance = 1000;
let spinning = false;
let bonusActive = false;
let currentBet = 10;

let gamesPlayed = 0;
let wins = 0;
let totalWon = 0;
let bestWin = 0;

const symbols = ['🍒', '🍋', '⭐', '💎', '7️⃣'];

// ========== DOM ЭЛЕМЕНТЫ ==========
// SPINS
const reel1 = document.getElementById('reel1');
const reel2 = document.getElementById('reel2');
const reel3 = document.getElementById('reel3');
const spinBtn = document.getElementById('spinBtn');
const betInput = document.getElementById('bet');
const balanceSpan = document.getElementById('balance');
const messageDiv = document.getElementById('message');
const quickBetBtns = document.querySelectorAll('.chip');

// PROFILE
const usernameEl = document.getElementById('username');
const avatarEl = document.getElementById('avatar');
const gamesPlayedEl = document.getElementById('gamesPlayed');
const winsEl = document.getElementById('wins');
const winRateEl = document.getElementById('winRate');
const profileBalanceEl = document.getElementById('profileBalance');
const totalWonEl = document.getElementById('totalWon');
const bestWinEl = document.getElementById('bestWin');

const achFirst = document.getElementById('achFirstStatus');
const achTen = document.getElementById('achTenStatus');
const achHundred = document.getElementById('achHundredStatus');
const achJackpot = document.getElementById('achJackpotStatus');
const achRich = document.getElementById('achRichStatus');

// ROCKET
const rocket = document.getElementById('rocket');
const multiplierDisplay = document.getElementById('multiplier');
const launchTimer = document.getElementById('launchTimer');
const scaleFill = document.getElementById('scaleFill');
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
let rocketState = 'waiting';
let rocketInterval = null;
let timerInterval = null;
let currentMultiplier = 1.0;
let crashPoint = 0;
let nextLaunchTime = 0;
let activeRocketBet = null;
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
    document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
    
    if (tab.dataset.tab === 'profile') updateProfileStats();
  });
});

// ========== SPINS ФУНКЦИИ ==========
quickBetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const multiplier = btn.dataset.multiplier;
    if (multiplier === 'max') {
      currentBet = balance;
    } else {
      currentBet = Math.min(10 * parseInt(multiplier), balance);
    }
    betInput.value = currentBet;
  });
});

spinBtn.addEventListener('click', spin);

function spin() {
  if (spinning) return;
  
  let bet = Number(betInput.value);
  if (bet < 1 || bet > balance) {
    messageDiv.textContent = '❌ Неверная ставка';
    return;
  }
  
  currentBet = bet;
  spinning = true;
  spinBtn.disabled = true;
  balance -= bet;
  updateBalance();
  
  gamesPlayed++;
  
  messageDiv.textContent = '🎰 Вращаем...';
  
  reel1.classList.add('spinning');
  reel2.classList.add('spinning');
  reel3.classList.add('spinning');
  
  let count = 0;
  const interval = setInterval(() => {
    reel1.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    reel2.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    reel3.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    count++;
    
    if (count > 15) {
      clearInterval(interval);
      finish();
    }
  }, 80);
  
  function finish() {
    const r1 = symbols[Math.floor(Math.random() * symbols.length)];
    const r2 = symbols[Math.floor(Math.random() * symbols.length)];
    const r3 = symbols[Math.floor(Math.random() * symbols.length)];
    
    reel1.textContent = r1;
    reel2.textContent = r2;
    reel3.textContent = r3;
    
    reel1.classList.remove('spinning');
    reel2.classList.remove('spinning');
    reel3.classList.remove('spinning');
    
    let win = 0;
    
    if (r1 === r2 && r2 === r3) {
      wins++;
      if (r1 === '💎') {
        win = bet * 50;
        achJackpot.textContent = '✅';
      } else {
        win = bet * 10;
      }
    } else if (r1 === r2 || r1 === r3 || r2 === r3) {
      wins++;
      win = bet * 2;
    }
    
    if (win > 0) {
      balance += win;
      totalWon += win;
      if (win > bestWin) bestWin = win;
      messageDiv.textContent = `🎉 Выигрыш +${win}`;
    } else {
      messageDiv.textContent = '😢 Повезёт в следующий раз';
    }
    
    updateBalance();
    checkAchievements();
    
    spinning = false;
    spinBtn.disabled = false;
  }
}

// ========== ROCKET ФУНКЦИИ ==========
function generateCrashPoint() {
  const r = Math.random();
  if (r < 0.3) return Math.round((Math.random() * 0.7 + 1.1) * 100) / 100;
  if (r < 0.55) return Math.round((Math.random() * 0.7 + 1.8) * 100) / 100;
  if (r < 0.75) return Math.round((Math.random() * 1.5 + 2.5) * 100) / 100;
  if (r < 0.9) return Math.round((Math.random() * 2.0 + 4.0) * 100) / 100;
  return Math.round((Math.random() * 4.0 + 6.0) * 100) / 100;
}

function addToHistory(multiplier) {
  const item = document.createElement('div');
  item.className = 'crash-history-item crash';
  item.textContent = multiplier.toFixed(2) + 'x';
  crashHistory.insertBefore(item, crashHistory.firstChild);
  while (crashHistory.children.length > 10) crashHistory.removeChild(crashHistory.lastChild);
}

function updateTimer() {
  const now = Date.now();
  const timeLeft = Math.max(0, Math.ceil((nextLaunchTime - now) / 1000));
  
  if (launchTimer) {
    launchTimer.textContent = `🚀 ${timeLeft}с`;
    launchTimer.style.display = rocketState === 'waiting' ? 'block' : 'none';
  }
  
  if (placeBetBtn) {
    placeBetBtn.disabled = !(rocketState === 'waiting' && timeLeft > 0) || activeRocketBet !== null;
  }
  
  if (timeLeft <= 0 && rocketState === 'waiting') startRocketFlight();
}

function startRocketFlight() {
  rocketState = 'flying';
  currentMultiplier = 1.0;
  crashPoint = generateCrashPoint();
  
  launchTimer.style.display = 'none';
  multiplierDisplay.textContent = '1.00x';
  scaleFill.style.height = '0%';
  rocket.style.transform = 'translateY(0)';
  
  if (rocketInterval) clearInterval(rocketInterval);
  
  let height = 0;
  rocketInterval = setInterval(() => {
    if (rocketState !== 'flying') return;
    
    currentMultiplier += 0.01;
    currentMultiplier = Math.round(currentMultiplier * 100) / 100;
    
    multiplierDisplay.textContent = currentMultiplier.toFixed(2) + 'x';
    
    height = Math.min(90, height + 0.4);
    rocket.style.transform = `translateY(-${height}px)`;
    
    const scalePercent = (currentMultiplier / 10) * 100;
    scaleFill.style.height = Math.min(100, scalePercent) + '%';
    
    if (currentMultiplier > 3) {
      multiplierDisplay.style.color = '#ff6b6b';
    } else if (currentMultiplier > 2) {
      multiplierDisplay.style.color = '#ffd966';
    }
    
    if (activeRocketBet && potentialWin) {
      potentialWin.textContent = Math.floor(activeRocketBet.amount * currentMultiplier);
    }
    
    if (currentMultiplier >= crashPoint) crashRocket();
  }, 60);
}

function crashRocket() {
  rocketState = 'crashed';
  clearInterval(rocketInterval);
  
  multiplierDisplay.textContent = crashPoint.toFixed(2) + 'x';
  multiplierDisplay.style.color = '#ff6b6b';
  rocket.style.transform = 'translateY(0) rotate(180deg)';
  
  if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('heavy');
  
  addToHistory(crashPoint);
  
  if (crashPoint > topMultiplier) {
    topMultiplier = crashPoint;
    topMultiplierDisplay.textContent = topMultiplier.toFixed(2) + 'x';
  }
  
  if (activeRocketBet) {
    activeRocketBet = null;
    activeBetDiv.style.display = 'none';
  }
  
  nextLaunchTime = Date.now() + 5000;
  rocketState = 'waiting';
  
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 100);
  
  setTimeout(() => {
    if (rocketState === 'waiting') startRocketFlight();
  }, 5000);
}

function cashoutRocket() {
  if (!activeRocketBet || rocketState !== 'flying') return;
  
  const win = Math.floor(activeRocketBet.amount * currentMultiplier);
  
  balance += win;
  rocketTotalWon += win;
  if (win > bestWin) bestWin = win;
  
  updateBalance();
  
  const item = document.createElement('div');
  item.className = 'crash-history-item';
  item.textContent = currentMultiplier.toFixed(2) + 'x';
  crashHistory.insertBefore(item, crashHistory.firstChild);
  
  multiplierDisplay.style.color = '#4caf50';
  setTimeout(() => multiplierDisplay.style.color = '', 200);
  
  if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
  
  activeRocketBet = null;
  activeBetDiv.style.display = 'none';
  
  rocketTotalWonDisplay.textContent = rocketTotalWon + ' 🪙';
}

function placeBet() {
  if (rocketState !== 'waiting') {
    alert('⏳ Дождись падения ракеты');
    return;
  }
  
  if (activeRocketBet) {
    alert('❌ Ставка уже есть');
    return;
  }
  
  const now = Date.now();
  if (now > nextLaunchTime) {
    alert('⏳ Время вышло');
    return;
  }
  
  const bet = parseInt(rocketBetInput.value);
  if (bet < 1 || bet > balance) {
    alert('❌ Неверная ставка');
    return;
  }
  
  balance -= bet;
  updateBalance();
  
  activeRocketBet = { amount: bet };
  activeBetDiv.style.display = 'block';
  currentBetAmount.textContent = bet;
  potentialWin.textContent = bet;
  
  placeBetBtn.disabled = true;
  
  if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

placeBetBtn.addEventListener('click', placeBet);
cashoutBtn.addEventListener('click', cashoutRocket);

// ========== ОБЩИЕ ФУНКЦИИ ==========
function updateBalance() {
  balanceSpan.textContent = balance;
  profileBalanceEl.textContent = balance;
}

function updateProfileStats() {
  gamesPlayedEl.textContent = gamesPlayed;
  winsEl.textContent = wins;
  winRateEl.textContent = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) + '%' : '0%';
  totalWonEl.textContent = totalWon;
  bestWinEl.textContent = bestWin;
  
  achFirst.textContent = gamesPlayed >= 1 ? '✅' : '❌';
  achTen.textContent = gamesPlayed >= 10 ? '✅' : '❌';
  achHundred.textContent = gamesPlayed >= 100 ? '✅' : '❌';
  achJackpot.textContent = bestWin >= 500 ? '✅' : '❌';
  achRich.textContent = balance >= 5000 ? '✅' : '❌';
}

function checkAchievements() {
  if (gamesPlayed >= 1) achFirst.textContent = '✅';
  if (gamesPlayed >= 10) achTen.textContent = '✅';
  if (gamesPlayed >= 100) achHundred.textContent = '✅';
  if (balance >= 5000) achRich.textContent = '✅';
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
setTimeout(() => {
  startRocketFlight();
}, 1000);

document.querySelector('[data-tab="profile"]').addEventListener('click', updateProfileStats);
