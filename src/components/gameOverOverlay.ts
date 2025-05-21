/**
 * Displays a game over overlay with the final score and navigation button.
 */
export class GameOverOverlay {
  static show(score: number): void {
    // Prevent duplicate overlay
    if (document.getElementById('gameOverOverlay')) return;

    // Create container for overlay
    const container = document.createElement('div');
    container.id = 'gameOverOverlay';

    // Create overlay content using manual DOM methods for better control
    const message = document.createElement('div');
    message.className = 'game-over-message';
    message.textContent = 'Game cleared!';

    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'game-over-score';
    scoreDisplay.textContent = `Score: ${score}`;

    const button = document.createElement('button');
    button.id = 'goToLeaderboardBtn';
    button.className = 'game-over-button';
    button.textContent = 'Best Scores';

    // Attach event listener to navigate to leaderboard
    button.addEventListener('click', () => {
      window.location.href = '/best-score';
    });

    // Append elements in order
    container.append(message, scoreDisplay, button);
    document.body.appendChild(container);
  }
}
