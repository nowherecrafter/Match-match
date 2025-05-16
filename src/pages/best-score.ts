import { GameDatabase } from '../services/db';
import md5 from 'md5';  // Импорт для MD5 хэширования

function getGravatarUrl(email: string, size = 40): string {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
}

export async function loadBestScore(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  const db = new GameDatabase();
  const results = await db.getTopPlayers(); // теперь возвращает GameResult & { player }

  if (results.length === 0) {
    app.innerHTML = `<p>No scores available.</p>`;
    return;
  }

  app.innerHTML = `
    <div class="content-wrapper">
      <div class="main-container">
        <h1 class="text-start">Best Scores</h1>

        <ol class="score-list">
          ${results.map((result, index) => {
            const player = result.player;
            const name = player ? `${player.firstName} ${player.lastName}` : 'Unknown Player';
            const email = player?.email ?? 'unknown@example.com';

            return `
              <li class="score-item">
                <div class="score-item-content">
                  <div class="score-item-avatar">
                    <img src="${getGravatarUrl(email)}" alt="${name}" />
                  </div>
                  <div class="score-item-details">
                    <div class="score-item-name">${name}</div>
                    <div class="score-item-email">${email}</div>
                  </div>
                  <div class="score-item-score">
                    <span class="score-item-score-text">Score:</span>
                    <span class="score-item-score-number">${result.score}</span>
                  </div>
                </div>
              </li>
              ${index < results.length - 1 ? '<hr class="divider">' : ''}
            `;
          }).join('')}
        </ol>
      </div>
    </div>
  `;
}
