// src/pages/game.ts
import { AppState } from '../services/state';
import { GameManager } from '../modules/gameManager'; // Подключаем GameManager

const gameManager = new GameManager();  // Экземпляр GameManager для старта/остановки игры

// Функция для обновления отображаемого времени
function updateTimerDisplay() {
  const { gameTime } = AppState.getState();
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    // Форматируем время в формат 00:00
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

// Функция, которая будет вызываться при загрузке страницы игры
export function loadGame(): void {
  const app = document.getElementById('app');
  if (!app) return;

  const content = `
    <div class="content-wrapper">
  <div class="main-container d-flex flex-column align-items-center">
    <!-- Таймер -->
    <div id="timer" class="timer my-4">
      00:00
    </div>

    <!-- Игровое поле -->
    <div id="gameBoard" class="container">
      <!-- Карточки будут динамически сюда добавляться -->
    </div>
  </div>
</div>
  `;

  app.innerHTML = content;

  // Подписываемся на изменения состояния времени
  document.addEventListener('stateChanged', updateTimerDisplay);

  // Если игра не началась, запускаем игру и таймер
  if (!AppState.getState().gameStarted) {
    gameManager.startGame();  // Начинаем игру и запускаем таймер
  }

  // При уходе с этой страницы остановим таймер
  window.addEventListener('beforeunload', () => {
    gameManager.stopGame(); // Останавливаем таймер при уходе со страницы
  });
}
