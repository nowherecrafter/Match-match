interface ScoreItem {
    name: string;
    email: string;
    score: number;
    avatar: string;
  }
  
  // Моковые данные для демонстрации
  const scoreData: ScoreItem[] = [
    { name: 'John Doe', email: 'johndoe@example.com', score: 5000, avatar: 'img/user-avatar.png' },
    { name: 'Jane Smith', email: 'janesmith@example.com', score: 4700, avatar: 'img/user-avatar.png' },
    { name: 'Mark Johnson', email: 'markjohnson@example.com', score: 4600, avatar: 'img/user-avatar.png' },
    // Дополните данными, если нужно
  ];
  
  export function loadBestScore(): void {
    const app = document.getElementById('app');
    if (!app) return;
  
    // Вставляем основной HTML шаблон
    app.innerHTML = `
      <div class="content-wrapper">
        <div class="main-container">
          <h1 class="text-start">Best Scores</h1>
          
          <ol class="score-list">
            ${scoreData.map((item, index) => `
              <li class="score-item">
                <div class="score-item-content">
                  <div class="score-item-avatar">
                    <img src="${item.avatar}" alt="${item.name}" />
                  </div>
                  <div class="score-item-details">
                    <div class="score-item-name">${item.name}</div>
                    <div class="score-item-email">${item.email}</div>
                  </div>
                  <div class="score-item-score">
                    <span class="score-item-score-text">Score:</span> <span class="score-item-score-number">${item.score}</span>
                  </div>
                </div>
              </li>
              ${index < scoreData.length - 1 ? '<hr class="divider">' : ''}
            `).join('')}
          </ol>
        </div>
      </div>
    `;
  }
  