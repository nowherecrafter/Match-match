export class GameOverOverlay {
  static show(score: number): void {
    if (document.getElementById('gameOverOverlay')) return;

    const container = document.createElement('div');
    container.id = 'gameOverOverlay';

    container.innerHTML = `
      <div class="game-over-message">Игра завершена!</div>
      <div class="game-over-score">Очки: ${score}</div>
      <button id="goToLeaderboardBtn" class="game-over-button">Таблица рекордов</button>
    `;

    const btn = container.querySelector('#goToLeaderboardBtn');
    btn?.addEventListener('click', () => {
      window.location.href = '/best-score';
    });

    document.body.appendChild(container);
  }
}