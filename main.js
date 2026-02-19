const tg = window.Telegram.WebApp;
tg.expand();

// Игровые переменные
let balance = 1000;
let spinning = false;
let bonusActive = false;
let currentBet = 10;

// Статистика
let gamesPlayed = 0;
let wins = 0;
let totalWon = 0;
let bestWin = 0;

// Символы
const symbols = ['🍒', '🍋', '⭐', '💎', '7️⃣'];

// DOM элементы
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

// Элементы профиля
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

// Telegram данные
if (tg.initDataUnsafe?.user) {
  const user = tg.initDataUnsafe.user;
  usernameEl.textContent = user.username ? `@${user.username}` : user.first_name;
  
  if (user.photo_url) {
    avatarEl.innerHTML = `<img src="${user.photo_url}" style="width:70px;height:70px;border-radius:50%;">`;
  }
}

// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК (самое важное!)
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Убираем active со всех вкладок
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Активируем выбранную вкладку
    tab.classList.add('active');
    document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
    
    // Обновляем статистику при переходе в профиль
    if (tab.dataset.tab === 'profile') {
      updateProfileStats();
    }
  });
});

// Быстрые ставки
quickBetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const multiplier = btn.dataset.multiplier;
    if (multiplier === 'max') {
      currentBet = balance;
    } else {
      currentBet = Math.min(10 * parseInt(multiplier), balance);
    }
    betInput.value = currentBet;
    
    // Эффект
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => btn.style.transform = 'scale(1)', 100);
  });
});

// Бонусные сундуки
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
    
    // Эффект
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

spinBtn.onclick = spin;

function updateBalance() {
  balanceSpan.textContent = balance;
  profileBalanceEl.textContent = `${balance} 🪙`;
  
  // Эффект пульсации
  balanceSpan.classList.add('pulse');
  setTimeout(() => balanceSpan.classList.remove('pulse'), 300);
}

function updateProfileStats() {
  gamesPlayedEl.textContent = gamesPlayed;
  winsEl.textContent = wins;
  winRateEl.textContent = gamesPlayed > 0 ? `${Math.round((wins / gamesPlayed) * 100)}%` : '0%';
  totalWonEl.textContent = `${totalWon} 🪙`;
  bestWinEl.textContent = `${bestWin} 🪙`;
  
  // Анимация цифр
  animateValue(gamesPlayedEl, 0, gamesPlayed, 500);
  
  // Достижения
  achFirst.textContent = gamesPlayed >= 1 ? '✅' : '❌';
  achTen.textContent = gamesPlayed >= 10 ? '✅' : '❌';
  achHundred.textContent = gamesPlayed >= 100 ? '✅' : '❌';
  achJackpot.textContent = bestWin >= currentBet * 50 ? '✅' : '❌';
  achRich.textContent = balance >= 5000 ? '✅' : '❌';
}

function animateValue(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 10);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      element.textContent = end;
      clearInterval(timer);
    } else {
      element.textContent = Math.round(current);
    }
  }, 10);
}

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
  
  // Эффекты
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
    
    // Эффект на балансе при выигрыше
    if (win > 0) {
      balanceSpan.classList.add('pulse');
      setTimeout(() => balanceSpan.classList.remove('pulse'), 500);
    }
    
    checkAchievements();
    
    spinning = false;
    spinBtn.disabled = false;
  }
}

function checkAchievements() {
  if (gamesPlayed >= 1) achFirst.textContent = '✅';
  if (gamesPlayed >= 10) achTen.textContent = '✅';
  if (gamesPlayed >= 100) achHundred.textContent = '✅';
  if (balance >= 5000) achRich.textContent = '✅';
// ========== ROCKET MODE ==========
let rocketActive = false;
let rocketInterval = null;
let currentMultiplier = 1.0;
let rocketBet = 0;
let crashPoint = 0;
let topMultiplier = 1.0;

const rocket = document.getElementById('rocket');
const multiplierDisplay = document.getElementById('multiplier');
const launchBtn = document.getElementById('launchBtn');
const cashoutBtn = document.getElementById('cashoutBtn');
const rocketBetInput = document.getElementById('rocketBet');
const autoCashoutInput = document.getElementById('autoCashout');
const crashHistory = document.getElementById('crashHistory');
const topMultiplierDisplay = document.getElementById('topMultiplier');
const rocketTotalWonDisplay = document.getElementById('rocketTotalWon');

let rocketTotalWon = 0;

// Генерация точки краша (рандомная)
function generateCrashPoint() {
  // Чем выше множитель, тем меньше шанс
  const r = Math.random();
  if (r < 0.3) return 1.2; // 30% шанс краша до 1.2
  if (r < 0.5) return 1.5; // 20% шанс краша до 1.5
  if (r < 0.7) return 2.0; // 20% шанс краша до 2.0
  if (r < 0.85) return 3.0; // 15% шанс краша до 3.0
  if (r < 0.95) return 5.0; // 10% шанс краша до 5.0
  return 10.0; // 5% шанс краша до 10.0
}

function startRocket() {
  if (rocketActive) return;
  
  rocketBet = parseInt(rocketBetInput.value);
  if (rocketBet < 1 || rocketBet > balance) {
    alert('❌ Неверная ставка');
    return;
  }
  
  // Списываем ставку
  balance -= rocketBet;
  updateBalance();
  
  rocketActive = true;
  launchBtn.disabled = true;
  cashoutBtn.disabled = false;
  rocketBetInput.disabled = true;
  
  currentMultiplier = 1.0;
  crashPoint = generateCrashPoint();
  
  // Анимация ракеты
  let height = 0;
  rocket.style.bottom = '0px';
  
  rocketInterval = setInterval(() => {
    if (!rocketActive) return;
    
    // Увеличиваем множитель
    currentMultiplier += 0.01;
    multiplierDisplay.textContent = currentMultiplier.toFixed(2) + 'x';
    
    // Поднимаем ракету
    height += 2;
    rocket.style.bottom = height + 'px';
    
    // Меняем цвет в зависимости от множителя
    if (currentMultiplier > 3) {
      multiplierDisplay.style.color = '#ff6b6b';
    } else if (currentMultiplier > 2) {
      multiplierDisplay.style.color = '#ffd700';
    }
    
    // Проверка на авто-забор
    const autoCashout = parseFloat(autoCashoutInput.value);
    if (currentMultiplier >= autoCashout) {
      cashout();
    }
    
    // Проверка на краш
    if (currentMultiplier >= crashPoint) {
      crash();
    }
  }, 50);
}

function cashout() {
  if (!rocketActive) return;
  
  clearInterval(rocketInterval);
  rocketActive = false;
  
  // Расчёт выигрыша
  const win = Math.floor(rocketBet * currentMultiplier);
  balance += win;
  rocketTotalWon += win;
  updateBalance();
  
  // Анимация победы
  multiplierDisplay.style.color = '#4caf50';
  rocket.style.animation = 'none';
  
  // Обновляем топ множитель
  if (currentMultiplier > topMultiplier) {
    topMultiplier = currentMultiplier;
    topMultiplierDisplay.textContent = topMultiplier.toFixed(2) + 'x';
  }
  
  // Добавляем в историю
  addToHistory(currentMultiplier, false);
  
  // Сброс
  setTimeout(() => {
    resetRocket();
  }, 1000);
}

function crash() {
  clearInterval(rocketInterval);
  rocketActive = false;
  
  // Анимация падения
  multiplierDisplay.style.color = '#ff6b6b';
  multiplierDisplay.textContent = '💥 CRASH!';
  rocket.style.animation = 'none';
  rocket.style.transform = 'rotate(180deg)';
  
  // Добавляем в историю
  addToHistory(currentMultiplier, true);
  
  // Сброс
  setTimeout(() => {
    resetRocket();
  }, 1500);
}

function addToHistory(multiplier, isCrash) {
  const item = document.createElement('div');
  item.className = 'crash-history-item' + (isCrash ? ' crash' : '');
  item.textContent = multiplier.toFixed(2) + 'x';
  
  crashHistory.insertBefore(item, crashHistory.firstChild);
  
  // Оставляем только последние 10
  while (crashHistory.children.length > 10) {
    crashHistory.removeChild(crashHistory.lastChild);
  }
}

function resetRocket() {
  rocketActive = false;
  launchBtn.disabled = false;
  cashoutBtn.disabled = true;
  rocketBetInput.disabled = false;
  
  currentMultiplier = 1.0;
  multiplierDisplay.textContent = '1.00x';
  multiplierDisplay.style.color = 'gold';
  rocket.style.bottom = '0px';
  rocket.style.transform = 'none';
  rocket.style.animation = 'rocketShake 0.2s infinite';
  
  rocketTotalWonDisplay.textContent = rocketTotalWon + ' 🪙';
}

// Обработчики
launchBtn.addEventListener('click', startRocket);
cashoutBtn.addEventListener('click', cashout);

// Обновляем состояние кнопок при переключении на вкладку ракеты
document.querySelector('[data-tab="rocket"]').addEventListener('click', () => {
  setTimeout(() => {
    if (!rocketActive) {
      launchBtn.disabled = false;
      rocketBetInput.disabled = false;
    }
  }, 300);
});
}

