import { GameDatabase } from '../services/db';
import md5 from 'md5';

/**
 * Generates a Gravatar URL based on user's email.
 * @param email - Email address used to generate the hash.
 * @param size - Size of the avatar image.
 */
function getGravatarUrl(email: string, size = 40): string {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
}

/**
 * Loads the Best Scores page and renders the top players with their avatars.
 */
export async function loadBestScore(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  const db = new GameDatabase();
  const results = await db.getTopPlayers();

  if (results.length === 0) {
    app.innerHTML = `<p>No scores available.</p>`;
    return;
  }

  // Clear previous content
  app.innerHTML = '';

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'content-wrapper';

  const container = document.createElement('div');
  container.className = 'main-container';

  const header = document.createElement('h1');
  header.className = 'text-start';
  header.textContent = 'Best Scores';

  const list = document.createElement('ol');
  list.className = 'score-list';

  results.forEach((result, index) => {
    const player = result.player;
    const name = player ? `${player.firstName} ${player.lastName}` : 'Unknown Player';
    const email = player?.email ?? 'unknown@example.com';

    // Score item container
    const listItem = document.createElement('li');
    listItem.className = 'score-item';

    const content = document.createElement('div');
    content.className = 'score-item-content';

    // Avatar
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'score-item-avatar';

    const avatar = document.createElement('img');
    avatar.src = getGravatarUrl(email);
    avatar.alt = name;

    avatarContainer.appendChild(avatar);

    // Player details
    const details = document.createElement('div');
    details.className = 'score-item-details';

    const nameEl = document.createElement('div');
    nameEl.className = 'score-item-name';
    nameEl.textContent = name;

    const emailEl = document.createElement('div');
    emailEl.className = 'score-item-email';
    emailEl.textContent = email;

    details.appendChild(nameEl);
    details.appendChild(emailEl);

    // Score display
    const score = document.createElement('div');
    score.className = 'score-item-score';

    const scoreText = document.createElement('span');
    scoreText.className = 'score-item-score-text';
    scoreText.textContent = 'Score:';

    const scoreNumber = document.createElement('span');
    scoreNumber.className = 'score-item-score-number';
    scoreNumber.textContent = result.score.toString();

    score.appendChild(scoreText);
    score.appendChild(scoreNumber);

    // Compose content
    content.appendChild(avatarContainer);
    content.appendChild(details);
    content.appendChild(score);

    listItem.appendChild(content);
    list.appendChild(listItem);

    // Optional divider
    if (index < results.length - 1) {
      const divider = document.createElement('hr');
      divider.className = 'divider';
      list.appendChild(divider);
    }
  });

  // Final assembly
  container.appendChild(header);
  container.appendChild(list);
  wrapper.appendChild(container);
  app.appendChild(wrapper);
}
