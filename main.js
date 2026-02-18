import './style.css'

// Символы для барабанов
const SYMBOLS = ['🍒', '🍋', '⭐', '💎', '7️⃣'];

// Множители выигрышей
const WIN_MULTIPLIERS = {
  '💎': { three: 50, two: 5 },
  'default': { three: 10, two: 2 }
};

class SlotMachine {
  constructor() {
    this.balance = 1000;
    this.isSpinning = false;
    
    // Элементы DOM
    this.balanceEl = document.getElementById('balance');
    this.reels = [
      document.getElementById('reel1'),
      document.getElementById('reel2'),
      document.getElementById('reel3')
    ];
    this.spinBtn = document.getElementById('spinBtn');
    this.betInput = document.getElementById('bet');
    this.messageEl = document.getElementById('message');
    
    // Привязываем обработчики
    this.spinBtn.addEventListener('click', () => this.spin());
    
    // Обновляем отображение баланса
    this.updateBalance();
    this.showMessage('🎲 Сделай ставку и крути!');
  }
  
  // Обновить баланс на экране
  updateBalance() {
    this.balanceEl.textContent = this.balance;
  }
  
  // Показать сообщение
  showMessage(text, isWin = false) {
    this.messageEl.textContent = text;
    this.messageEl.style.color = isWin ? 'gold' : 'white';
  }
  
  // Получить случайный символ
  getRandomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  }
  
  // Анимация вращения
  async spinAnimation() {
    // Запускаем анимацию
    this.reels.forEach(reel => reel.classList.add('spinning'));
    
    // Меняем символы каждые 100мс для эффекта вращения
    const spinInterval = setInterval(() => {
      this.reels.forEach(reel => {
        reel.textContent = this.getRandomSymbol();
      });
    }, 100);
    
    // Ждём 1 секунду
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Останавливаем анимацию
    clearInterval(spinInterval);
    this.reels.forEach(reel => reel.classList.remove('spinning'));
  }
  
  // Проверить выигрыш
  checkWin(symbols, bet) {
    const [s1, s2, s3] = symbols;
    
    // Проверяем три одинаковых
    if (s1 === s2 && s2 === s3) {
      const multiplier = WIN_MULTIPLIERS[s1]?.three || WIN_MULTIPLIERS.default.three;
      const winAmount = bet * multiplier;
      return { win: true, amount: winAmount, message: `🎉 ДЖЕКПОТ! x${multiplier}` };
    }
    
    // Проверяем два одинаковых
    if (s1 === s2 || s1 === s3 || s2 === s3) {
      const multiplier = WIN_MULTIPLIERS.default.two;
      const winAmount = bet * multiplier;
      return { win: true, amount: winAmount, message: `👍 Неплохо! x${multiplier}` };
    }
    
    return { win: false, amount: 0, message: '😢 Повезёт в следующий раз' };
  }
  
  // Основной спин
  async spin() {
    if (this.isSpinning) return;
    
    // Получаем ставку
    const bet = parseInt(this.betInput.value);
    
    // Проверки
    if (isNaN(bet) || bet < 1) {
      this.showMessage('❌ Минимальная ставка 1');
      return;
    }
    
    if (bet > this.balance) {
      this.showMessage('❌ Недостаточно монет!');
      return;
    }
    
    // Начинаем игру
    this.isSpinning = true;
    this.spinBtn.disabled = true;
    this.betInput.disabled = true;
    
    // Списываем ставку
    this.balance -= bet;
    this.updateBalance();
    this.showMessage('🎰 Вращаем...');
    
    // Анимация вращения
    await this.spinAnimation();
    
    // Генерируем финальные символы
    const finalSymbols = [
      this.getRandomSymbol(),
      this.getRandomSymbol(),
      this.getRandomSymbol()
    ];
    
    // Показываем результат
    this.reels.forEach((reel, i) => {
      reel.textContent = finalSymbols[i];
    });
    
    // Проверяем выигрыш
    const result = this.checkWin(finalSymbols, bet);
    
    if (result.win) {
      this.balance += result.amount;
      this.updateBalance();
      this.showMessage(`${result.message} +${result.amount} 🪙`, true);
    } else {
      this.showMessage(result.message);
    }
    
    // Завершаем
    this.isSpinning = false;
    this.spinBtn.disabled = false;
    this.betInput.disabled = false;
  }
}

// Запускаем игру при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  new SlotMachine();
});