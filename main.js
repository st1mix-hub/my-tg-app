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
}
