let balance = 1000;
let spinning = false;

const symbols = ['🍒', '🍋', '⭐', '💎', '7️⃣'];

const reel1 = document.getElementById('reel1');
const reel2 = document.getElementById('reel2');
const reel3 = document.getElementById('reel3');
const spinBtn = document.getElementById('spinBtn');
const betInput = document.getElementById('bet');
const balanceSpan = document.getElementById('balance');
const messageDiv = document.getElementById('message');

spinBtn.onclick = spin;

function spin() {
  if (spinning) return;
  
  let bet = Number(betInput.value);
  if (bet < 1 || bet > balance) {
    messageDiv.textContent = '❌ Неверная ставка';
    return;
  }
  
  spinning = true;
  spinBtn.disabled = true;
  balance -= bet;
  balanceSpan.textContent = balance;
  
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
      win = bet * (r1 === '💎' ? 50 : 10);
      messageDiv.textContent = `🎉 ДЖЕКПОТ! +${win} 🪙`;
    } else if (r1 === r2 || r1 === r3 || r2 === r3) {
      win = bet * 2;
      messageDiv.textContent = `👍 Неплохо! +${win} 🪙`;
    } else {
      messageDiv.textContent = '😢 Повезёт в следующий раз';
    }
    
    if (win > 0) {
      balance += win;
      balanceSpan.textContent = balance;
    }
    
    spinning = false;
    spinBtn.disabled = false;
  }
}
