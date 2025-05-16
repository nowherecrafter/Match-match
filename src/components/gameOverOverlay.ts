export class GameOverOverlay {
  private container: HTMLElement;

  constructor(private score: number, private onLeaderboardClick: () => void) {
    this.container = document.createElement('div');
    this.container.id = 'gameOverOverlay';

    this.container.innerHTML = `
      <div class="game-over-message">Поздравляем! Игра окончена.</div>
      <div class="game-over-score">Ваш результат: ${score} очков</div>
      <button id="goToLeaderboardBtn" class="game-over-button">Перейти к рекордам</button>
    `;

    this.container.querySelector('#goToLeaderboardBtn')?.addEventListener('click', () => {
      this.onLeaderboardClick();
    });
  }

  show(parent: HTMLElement) {
    parent.appendChild(this.container);
  }

  hide() {
    this.container.remove();
  }
}
