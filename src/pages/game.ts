import { AppState } from '../services/state';
import { GameManager } from '../modules/gameManager';

const gameManager = new GameManager();

function updateTimerDisplay() {
  const { gameTime } = AppState.getState();
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

export function loadGame(): void {
  const app = document.getElementById('app');
  if (!app) return;

  const content = `
    <div class="content-wrapper">
      <div class="main-container d-flex flex-column align-items-center">
        <div id="timer" class="timer my-4">00:00</div>
        <div id="gameBoard" class="container"></div>
      </div>
    </div>
  `;

  app.innerHTML = content;

  document.addEventListener('stateChanged', updateTimerDisplay);

  if (!AppState.getState().gameStarted) {
    gameManager.startGame();
  }
}

export function unloadGame(): void {
  gameManager.stopGame();
  document.removeEventListener('stateChanged', updateTimerDisplay);
}
