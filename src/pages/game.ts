import { AppState } from '../services/state';
import { GameManager } from '../modules/gameManager';

const gameManager = new GameManager();

let isTimerListenerActive = false;

/**
 * Creates and returns the game layout DOM structure.
 */
function createGameLayout(): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'content-wrapper';

  const container = document.createElement('div');
  container.className = 'main-container d-flex flex-column align-items-center';

  const timer = document.createElement('div');
  timer.id = 'timer';
  timer.className = 'timer my-4';
  timer.textContent = '00:00';

  const board = document.createElement('div');
  board.id = 'gameBoard';
  board.className = 'container';

  container.append(timer, board);
  wrapper.appendChild(container);

  return wrapper;
}

/**
 * Updates the timer UI with the current time from the AppState.
 */
function updateTimerDisplay() {
  const { gameTime } = AppState.getState();
  const timerElement = document.getElementById('timer');
  if (!timerElement) return;

  const minutes = Math.floor(gameTime / 60);
  const seconds = gameTime % 60;
  timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Initializes the game screen and starts the game if not already running.
 */
export function loadGame(): void {
  const app = document.getElementById('app');
  if (!app) return;

  // Clear previous content and render new structure
  app.innerHTML = '';
  app.appendChild(createGameLayout());

  // Immediately update timer display on load
  updateTimerDisplay();

  // Add event listener for timer updates if not already added
  if (!isTimerListenerActive) {
    document.addEventListener('stateChanged', updateTimerDisplay);
    isTimerListenerActive = true;
  }

  // Start game if not already running
  if (!AppState.getState().gameStarted) {
    gameManager.startGame();
  }
}

/**
 * Cleans up game state and event listeners when unloading the game.
 */
export function unloadGame(): void {
  gameManager.stopGame();

  if (isTimerListenerActive) {
    document.removeEventListener('stateChanged', updateTimerDisplay);
    isTimerListenerActive = false;
  }
}
