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
const rocket = document.querySelector('.rocket-body');
const rocketFire = document.getElementById('rocketFire');
const rocketTrail = document.getElementById('rocketTrail');
const multiplierDisplay = document.getElementById('multiplier');
const betTimer = document.getElementById('betTimer');
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
    
    if (tab.dataset.tab === 'profile') {
      updateProfileStats();
    }
  });
});

// ========== ФУНКЦИИ КАЗИНО ==========
quickBetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const multiplier = btn.dataset.multiplier;
    if (multiplier === 'max') {
      currentBet = balance;
    } else {
      currentBet = Math.min(10 * parseInt(multiplier), balance);
    }
    betInput.value = currentBet;
    
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => btn.style.transform = 'scale(1)', 100);
  });
});

chests.forEach((chest, index) => {
  chest.addEventListener('click', () => {
    if (!bonusActive) return;
    
    const multipliers = [2, 3, 5];
    const win = currentBet * multipliers[index];
    
    chest.classList.add('opened');
    chest.textContent = `💰 x${multipliers[index]}`;
    
    balance += win;
    totalWon += win;
    if (win > bestWin) bestWin = win;
    
    updateBalance();
    messageDiv.textContent = `🎁 БОНУС! +${win} 🪙`;
    messageDiv.style.color = 'gold';
    
    balanceSpan.classList.add('pulse');
    setTimeout(() => balanceSpan.classList.remove('pulse'), 300);
    
    setTimeout(() => {
      bonusGame.style.display = 'none';
      chests.forEach(c => {
        c.classList.remove('opened');
        c.textContent = '📦';
      });
      bonusActive = false;
    }, 2000);
  });
});

spinBtn.addEventListener('click', spin);

function spin() {
  if (spinning || bonusActive) return;
  
  let bet = Number(betInput.value);
  if (bet < 1 || bet > balance) {
    messageDiv.textContent = '❌ Неверная ставка';
    messageDiv.style.color = '#ff6b6b';
    return;
  }
  
  currentBet = bet;
  spinning = true;
  spinBtn.disabled = true;
  balance -= bet;
  updateBalance();
  
  gamesPlayed++;
  
  messageDiv.textContent = '🎰 Вращаем...';
  messageDiv.style.color = 'gold';
  
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
    let message = '';
    
    if (r1 === r2 && r2 === r3) {
      wins++;
      if (r1 === '💎') {
        win = bet * 50;
        message = `🎉 ДЖЕКПОТ! +${win} 🪙`;
        achJackpot.textContent = '✅';
        
        setTimeout(() => {
          bonusGame.style.display = 'flex';
          bonusActive = true;
        }, 500);
      } else {
        win = bet * 10;
        message = `🎉 ТРИ ОДИНАКОВЫХ! +${win} 🪙`;
      }
    } else if (r1 === r2 || r1 === r3 || r2 === r3) {
      wins++;
      win = bet * 2;
      message = `👍 ДВА ОДИНАКОВЫХ! +${win} 🪙`;
    } else {
      message = '😢 Повезёт в следующий раз';
    }
    
    if (win > 0) {
      balance += win;
      totalWon += win;
      if (win > bestWin) bestWin = win;
      updateBalance();
      messageDiv.style.color = '#4caf50';
    } else {
      messageDiv.style.color = '#ff6b6b';
    }
    
    messageDiv.textContent = message;
    
    if (win > 0) {
      balanceSpan.classList.add('pulse');
      setTimeout(() => balanceSpan.classList.remove('pulse'), 500);
    }
    
    checkAchievements();
    
    spinning = false;
    spinBtn.disabled = false;
  }
}

// ========== ФУНКЦИИ РАКЕТЫ ==========

// Генерация случайного множителя краша (не целые числа)
function generateCrashPoint() {
  // Генерируем случайное число от 1.1 до 10.0 с двумя знаками после запятой
  const base = Math.random() * 9 + 1.1;
  return Math.round(base * 100) / 100;
}

// Добавление в историю
function addToHistory(multiplier, isCrash) {
  const item = document.createElement('div');
  item.className = 'crash-history-item' + (isCrash ? ' crash' : '');
  item.textContent = multiplier.toFixed(2) + 'x';
  
  crashHistory.insertBefore(item, crashHistory.firstChild);
  
  while (crashHistory.children.length > 10) {
    crashHistory.removeChild(crashHistory.lastChild);
  }
}

// Обновление таймера для ставок
function updateBetTimer() {
  const now = Date.now();
  const timeLeft = Math.max(0, Math.ceil((nextLaunchTime - now) / 1000));
  
  if (betTimer) {
    const timerSpan = betTimer.querySelector('span');
    if (timerSpan) timerSpan.textContent = timeLeft + 'с';
    betTimer.style.display = rocketState === 'waiting' ? 'block' : 'none';
  }
  
  // Включаем кнопку ставки только когда ракета упала и идёт таймер
  if (placeBetBtn) {
    placeBetBtn.disabled = rocketState !== 'waiting' || activeRocketBet !== null;
  }
  
  if (timeLeft <= 0 && rocketState === 'waiting') {
    startRocketFlight();
  }
}

// Запуск полёта
function startRocketFlight() {
  rocketState = 'flying';
  currentMultiplier = 1.0;
  crashPoint = generateCrashPoint();
  
  // Скрываем таймер
  if (betTimer) betTimer.style.display = 'none';
  
  // Обновляем отображение
  if (multiplierDisplay) {
    multiplierDisplay.textContent = '1.00x';
    multiplierDisplay.style.color = 'gold';
  }
  
  // Сбрасываем позицию ракеты
  if (rocket) {
    rocket.style.transform = 'translateY(0)';
  }
  
  if (rocketFire) {
    rocketFire.style.opacity = '1';
  }
  
  // Сбрасываем хвост
  if (rocketTrail) {
    rocketTrail.style.height = '0px';
  }
  
  if (rocketInterval) clearInterval(rocketInterval);
  
  let height = 0;
  rocketInterval = setInterval(() => {
    if (rocketState !== 'flying') return;
    
    currentMultiplier += 0.01;
    currentMultiplier = Math.round(currentMultiplier * 100) / 100;
    
    // Обновление множителя
    if (multiplierDisplay) {
      multiplierDisplay.textContent = currentMultiplier.toFixed(2) + 'x';
    }
    
    // Подъём ракеты (до 80px)
    height = Math.min(80, height + 0.8);
    if (rocket) {
      rocket.style.transform = `translateY(-${height}px)`;
    }
    
    // Хвост становится длиннее
    if (rocketTrail) {
      rocketTrail.style.height = (height * 0.5) + 'px';
    }
    
    // Изменение цвета в зависимости от множителя
    if (currentMultiplier > 3 && multiplierDisplay) {
      multiplierDisplay.style.color = '#ff6b6b';
    } else if (currentMultiplier > 2 && multiplierDisplay) {
      multiplierDisplay.style.color = '#ffd700';
    }
    
    // Обновление потенциального выигрыша
    if (activeRocketBet && potentialWin) {
      potentialWin.textContent = Math.floor(activeRocketBet.amount * currentMultiplier);
    }
    
    // Проверка на краш
    if (currentMultiplier >= crashPoint) {
      crashRocket();
    }
  }, 50);
}

// Краш ракеты
function crashRocket() {
  rocketState = 'crashed';
  if (rocketInterval) clearInterval(rocketInterval);
  
  // Просто показываем множитель краша (без слова CRASH)
  if (multiplierDisplay) {
    multiplierDisplay.textContent = crashPoint.toFixed(2) + 'x';
    multiplierDisplay.style.color = '#ff6b6b';
  }
  
  // Анимация падения
  if (rocket) {
    rocket.style.transform = 'translateY(0) rotate(180deg)';
  }
  
  if (rocketFire) {
    rocketFire.style.opacity = '0';
  }
  
  if (rocketTrail) {
    rocketTrail.style.height = '0px';
  }
  
  addToHistory(crashPoint, true);
  
  if (crashPoint > topMultiplier) {
    topMultiplier = crashPoint;
    if (topMultiplierDisplay) {
      topMultiplierDisplay.textContent = topMultiplier.toFixed(2) + 'x';
    }
  }
  
  // Если была активная ставка - проигрыш
  if (activeRocketBet) {
    activeRocketBet = null;
    if (activeBetDiv) activeBetDiv.style.display = 'none';
  }
  
  // Запускаем таймер для следующей ставки (5 секунд)
  nextLaunchTime = Date.now() + 5000;
  
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateBetTimer, 100);
  
  // Через 5 секунд автоматически запускаем новый полёт
  setTimeout(() => {
    if (rocketState === 'crashed') {
      rocketState = 'waiting';
      startRocketFlight();
    }
  }, 5000);
}

// Забрать выигрыш
function cashoutRocket() {
  if (!activeRocketBet || rocketState !== 'flying') return;
  
  const win = Math.floor(activeRocketBet.amount * currentMultiplier);
  
  balance += win;
  rocketTotalWon += win;
  if (win > bestWin) bestWin = win;
  
  updateBalance();
  
  addToHistory(currentMultiplier, false);
  
  // Эффект при выигрыше
  if (multiplierDisplay) {
    multiplierDisplay.style.color = '#4caf50';
    multiplierDisplay.style.transform = 'scale(1.5)';
    setTimeout(() => {
      if (multiplierDisplay) multiplierDisplay.style.transform = 'scale(1)';
    }, 200);
  }
  
  activeRocketBet = null;
  if (activeBetDiv) activeBetDiv.style.display = 'none';
  
  if (rocketTotalWonDisplay) {
    rocketTotalWonDisplay.textContent = rocketTotalWon + ' 🪙';
  }
}

// Поставить ставку (ТОЛЬКО КОГДА РАКЕТА УПАЛА)
function placeBet() {
  // Можно ставить только когда ракета упала (ждущий режим)
  if (rocketState !== 'waiting') {
    alert('⏳ Дождись следующего запуска!');
    return;
  }
  
  if (activeRocketBet) {
    alert('❌ У тебя уже есть активная ставка');
    return;
  }
  
  const bet = parseInt(rocketBetInput.value);
  if (bet < 1 || bet > balance) {
    alert('❌ Неверная ставка');
    return;
  }
  
  balance -= bet;
  updateBalance();
  
  activeRocketBet = {
    amount: bet,
    multiplierAtBet: currentMultiplier
  };
  
  if (activeBetDiv) activeBetDiv.style.display = 'block';
  if (currentBetAmount) currentBetAmount.textContent = bet;
  if (potentialWin) potentialWin.textContent = bet;
  
  // Отключаем кнопку ставки после размещения
  if (placeBetBtn) placeBetBtn.disabled = true;
}

// ========== ОБЩИЕ ФУНКЦИИ ==========
function updateBalance() {
  if (balanceSpan) balanceSpan.textContent = balance;
  if (profileBalanceEl) profileBalanceEl.textContent = `${balance} 🪙`;
  
  balanceSpan.classList.add('pulse');
  setTimeout(() => balanceSpan.classList.remove('pulse'), 300);
}

function updateProfileStats() {
  if (gamesPlayedEl) gamesPlayedEl.textContent = gamesPlayed;
  if (winsEl) winsEl.textContent = wins;
  if (winRateEl) {
    winRateEl.textContent = gamesPlayed > 0 ? `${Math.round((wins / gamesPlayed) * 100)}%` : '0%';
  }
  if (totalWonEl) totalWonEl.textContent = `${totalWon} 🪙`;
  if (bestWinEl) bestWinEl.textContent = `${bestWin} 🪙`;
  
  if (achFirst) achFirst.textContent = gamesPlayed >= 1 ? '✅' : '❌';
  if (achTen) achTen.textContent = gamesPlayed >= 10 ? '✅' : '❌';
  if (achHundred) achHundred.textContent = gamesPlayed >= 100 ? '✅' : '❌';
  if (achJackpot) achJackpot.textContent = bestWin >= 500 ? '✅' : '❌';
  if (achRich) achRich.textContent = balance >= 5000 ? '✅' : '❌';
}

function checkAchievements() {
  if (gamesPlayed >= 1 && achFirst) achFirst.textContent = '✅';
  if (gamesPlayed >= 10 && achTen) achTen.textContent = '✅';
  if (gamesPlayed >= 100 && achHundred) achHundred.textContent = '✅';
  if (balance >= 5000 && achRich) achRich.textContent = '✅';
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
setTimeout(() => {
  rocketState = 'waiting';
  // Запускаем первый полёт через 1 секунду
  setTimeout(() => {
    startRocketFlight();
  }, 1000);
}, 1000);

if (placeBetBtn) placeBetBtn.addEventListener('click', placeBet);
if (cashoutBtn) cashoutBtn.addEventListener('click', cashoutRocket);

document.querySelector('[data-tab="profile"]').addEventListener('click', updateProfileStats);
