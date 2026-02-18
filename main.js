import './style.css'

const SYMBOLS = ['🍒', '🍋', '⭐', '💎', '7️⃣'];

class SlotMachine {
  constructor() {
    this.balance = 1000;
    this.isSpinning = false;
    
    this.balanceEl = document.getElementById('balance');
    this.reels = [
      document.getElementById('reel1'),
      document.getElementById('reel2'),
      document.getElementById('reel3')
    ];
    this.spinBtn = document.getElementById('spinBtn');
    this.betInput = document.getElementById('bet');
    this.messageEl = document.getElementById('message');
    
    this.spinBtn.addEventListener('click', () => this.spin());
    
    this.updateBalance();
  }
  
  updateBalance() {
    if (this.balanceEl) this.balanceEl.textContent = this.balance;
  }
  
  showMessage(text, isWin = false) {
    if (this.messageEl) {
      this.messageEl.textContent = text;
      this.messageEl.style.color = isWin ? 'gold' : 'white';
    }
  }
  
  getRandomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  }
  
  async spinAnimation() {
    this.reels.forEach(reel => {
      if (reel) reel.classList.add('spinning');
    });
    
    const spinInterval = setInterval(() => {
      this.reels.forEach(reel => {
        if (reel) reel.textContent = this.getRandomSymbol();
      });
    }, 100);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    clearInterval(spinInterval);
    this.reels.forEach(reel => {
      if (reel) reel.classList.remove('spinning');
    });
  }
  
  checkWin(symbols, bet) {
    const [s1, s2, s3] = symbols;
    
    if (s1 === s2 && s2 === s3) {
      let multiplier = 10;
      if (s1 === '💎') multiplier = 50;
      const winAmount = bet * multiplier;
      return { win: true, amount: winAmount, message: `🎉 ДЖЕКПОТ! x${multiplier}` };
    }
    
    if (s1 === s2 || s1 === s3 || s2 === s3) {
      const winAmount = bet * 2;
      return { win: true, amount: winAmount, message: `👍 Неплохо! x2` };
    }
    
    return { win: false, amount: 0, message: '😢 Повезёт в следующий раз' };
  }
  
  async spin() {
    if (this.isSpinning) return;
    
    const bet = parseInt(this.betInput?.value || 10);
    
    if (isNaN(bet) || bet < 1) {
      this.showMessage('❌ Минимальная ставка 1');
      return;
    }
    
    if (bet > this.balance) {
      this.showMessage('❌ Недостаточно монет!');
      return;
    }
    
    this.isSpinning = true;
    if (this.spinBtn) this.spinBtn.disabled = true;
    if (this.betInput) this.betInput.disabled = true;
    
    this.balance -= bet;
    this.updateBalance();
    this.showMessage('🎰 Вращаем...');
    
    await this.spinAnimation();
    
    const finalSymbols = [
      this.getRandomSymbol(),
      this.getRandomSymbol(),
      this.getRandomSymbol()
    ];
    
    this.reels.forEach((reel, i) => {
      if (reel) reel.textContent = finalSymbols[i];
    });
    
    const result = this.checkWin(finalSymbols, bet);
    
    if (result.win) {
      this.balance += result.amount;
      this.updateBalance();
      this.showMessage(`${result.message} +${result.amount} 🪙`, true);
    } else {
      this.showMessage(result.message);
    }
    
    this.isSpinning = false;
    if (this.spinBtn) this.spinBtn.disabled = false;
    if (this.betInput) this.betInput.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SlotMachine();
});
