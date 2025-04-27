import { GameDatabase } from "../services/db";

export function loadSettings(): void {
    const app = document.getElementById('app');
    if (!app) return;
  
    // Данные для настроек
    const settings = [
      { name: 'Card Type', options: ['Animals', 'Cars', 'Nature'] },
      { name: 'Difficulty', options: ['4x4', '6x6', '8x8'] },
    ];
  
    // Шаблон для рендеринга страницы настроек
    const content = `
    <div class="content-wrapper">
      <div class="main-container">
        <h1 class="text-start">Game Settings</h1>
        <form id="settingsForm">
          ${settings.map(setting => `
            <div class="mb-3">
              <label for="${setting.name}" class="form-label">${setting.name}</label>
              <select id="${setting.name}" class="form-select">
                ${setting.options.map(option => `
                  <option value="${option}">${option}</option>
                `).join('')}
              </select>
            </div>
          `).join('')}
        </form>
      </div>
    </div>
  `;
  
  
    // Вставляем в DOM
    app.innerHTML = content;
  
    // Обработчик изменений настроек
    const form = document.getElementById('settingsForm') as HTMLFormElement;
    if (form) {
      form.addEventListener('change', () => {
        // Получение значений и их сохранение в IndexedDB
        const selectedCardType = (document.getElementById('Card Type') as HTMLSelectElement).value;
        const selectedDifficulty = (document.getElementById('Difficulty') as HTMLSelectElement).value;
        
        // Логика сохранения настроек в IndexedDB
        const db = new GameDatabase();
        db.init().then(() => {
          db.addGameSettings({ cardType: selectedCardType, difficulty: selectedDifficulty });
        });
      });
    }
  }
  
  