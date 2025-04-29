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
          <div id="gameBoard" class="game-board mt-4 d-grid gap-3">
            <!-- Карточки будут динамически сюда добавляться -->
          </div>
  
        </div>
      </div>
    `;
  
    app.innerHTML = content;
  }
  
