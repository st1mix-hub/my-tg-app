let balance = 1000;
let spinning = false;
let bonusActive = false;
let currentBet = 10;

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
const quickBetBtns = document.querySelectorAll('.quick-bet');

// Звуки
const spinSound = document.getElementById('spinSound');
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');
const bonusSound = document.getElementById('bonusSound');

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
    balanceSpan.textContent = balance;
    messageDiv.textContent = `🎁 БОНУС! +${win} 🪙`;
    
    winSound.play();
    
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

function playSound(sound) {
  sound.currentTime = 0;
  sound.play().catch(e => console.log('Звук не загрузился'));
}

function spin() {
  if (spinning || bonusActive) return;
  
  let bet = Number(betInput.value);
  if (bet < 1 || bet > balance) {
    messageDiv.textContent = '❌ Неверная ставка';
    return;
  }
  
  currentBet = bet;
  spinning = true;
  spinBtn.disabled = true;
  balance -= bet;
  balanceSpan.textContent = balance;
  
  playSound(spinSound);
  
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
    
    // Проверка выигрыша
    if (r1 === r2 && r2 === r3) {
      if (r1 === '💎') {
        win = bet * 50;
        message = `🎉 ДЖЕКПОТ x50! +${win} 🪙`;
        playSound(winSound);
        // Запускаем бонус
        setTimeout(() => {
          bonusGame.style.display = 'block';
          bonusActive = true;
          playSound(bonusSound);
        }, 500);
      } else {
        win = bet * 10;
        message = `🎉 ТРИ ОДИНАКОВЫХ! +${win} 🪙`;
        playSound(winSound);
      }
    } else if (r1 === r2 || r1 === r3 || r2 === r3) {
      win = bet * 2;
      message = `👍 ДВА ОДИНАКОВЫХ! +${win} 🪙`;
      playSound(winSound);
    } else {
      message = '😢 Повезёт в следующий раз';
      playSound(loseSound);
    }
    
    if (win > 0) {
      balance += win;
      balanceSpan.textContent = balance;
    }
    
    messageDiv.textContent = message;
    
    spinning = false;
    spinBtn.disabled = false;
  }
}
