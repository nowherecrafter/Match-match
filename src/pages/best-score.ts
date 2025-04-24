import { Player } from '../types'; // Правильные импорты
import { GameDatabase } from '../services/db';
import md5 from 'md5';  // Импорт для MD5 хэширования

// Функция для генерации URL Gravatar по email пользователя
function getGravatarUrl(email: string, size = 40): string {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
}

export async function loadBestScore(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  // Инициализация базы данных и получение топ игроков
  const db = new GameDatabase();
  const players = await db.getTopPlayers();

  // Проверка, что данные получены
  console.log('Top Players:', players);

  if (players.length === 0) {
    app.innerHTML = `<p>No scores available.</p>`;
    return;
  }

  // Формируем HTML с данными игроков
  app.innerHTML = `
    <div class="content-wrapper">
      <div class="main-container">
        <h1 class="text-start">Best Scores</h1>

        <ol class="score-list">
          ${players.map((player, index) => `
            <li class="score-item">
              <div class="score-item-content">
                <div class="score-item-avatar">
                  <img src="${getGravatarUrl(player.email)}" alt="${player.firstName} ${player.lastName}" />
                </div>
                <div class="score-item-details">
                  <div class="score-item-name">${player.firstName} ${player.lastName}</div>
                  <div class="score-item-email">${player.email}</div>
                </div>
                <div class="score-item-score">
                  <span class="score-item-score-text">Score:</span> <span class="score-item-score-number">${player.bestScore}</span>
                </div>
              </div>
            </li>
            ${index < players.length - 1 ? '<hr class="divider">' : ''}
          `).join('')}
        </ol>
      </div>
    </div>
  `;
}

