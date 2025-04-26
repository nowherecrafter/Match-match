import { AppState } from '../modules/state';
import { GameDatabase } from '../services/db';
import { RegistrationModal } from './registrationModal';  // 👈 Импортируем модальное окно
import md5 from 'md5';

function getGravatarUrl(email: string, size = 40): string {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
}



class Header {
  private static instance: Header;
  private element: HTMLElement;
  private isMounted = false;
  private registrationModal: RegistrationModal; // 👈 Модалка станет полем класса

  private constructor() {
    this.registrationModal = new RegistrationModal(); // 👈 Создаём модалку
    this.element = this.createHeader();
    this.setupEventListeners();
    this.subscribeToState();
    this.updateUI(AppState.getState());
  }

  private createHeader(): HTMLElement {
    const header = document.createElement('header');
    header.classList.add('game-header');
    header.innerHTML = `
      <div class="logo">
          <div class="logo__part logo__part--top">MATCH</div>
          <div class="logo__part logo__part--bottom">MATCH</div>
      </div>

      <nav class="game-nav">
          <a href="/about" class="nav-link">About Game</a>
          <a href="/best-score" class="nav-link">Best Score</a>
          <a href="/settings" class="nav-link">Game Settings</a>
      </nav>

      <div class="header-actions">
          <button class="btn btn--register hidden" id="registerBtn">Register New Player</button>
          <button class="btn btn--start hidden" id="startGameBtn">Start Game</button>
          <button class="btn btn--stop hidden" id="stopGameBtn">End Game</button>
          <div class="user-avatar hidden" id="userAvatar">
              <img src="assets/default-avatar.png" alt="User">
          </div>
      </div>
    `;
    return header;
  }

  private setupEventListeners(): void {
    this.element.querySelector('#startGameBtn')?.addEventListener('click', () => {
      AppState.updateState({ gameStarted: true });
    });

    this.element.querySelector('#stopGameBtn')?.addEventListener('click', () => {
      AppState.updateState({ gameStarted: false });
    });

    this.element.querySelector('#registerBtn')?.addEventListener('click', () => {
      this.registrationModal.show(); // 👈 Открыть модалку по клику
    });
  }

  private subscribeToState(): void {
    document.addEventListener('stateChanged', () => {
      this.updateUI(AppState.getState());
    });
  }

  public static getInstance(): Header {
    if (!Header.instance) {
      Header.instance = new Header();
    }
    return Header.instance;
  }

  public mount(containerId: string = 'header-container'): void {
    if (this.isMounted) return;

    const container = document.getElementById(containerId);
    if (container) {
      container.appendChild(this.element);
      this.isMounted = true;
    }
  }

  updateUI(state: typeof AppState.state): void {
    const { isAuthenticated, gameStarted, currentPlayerId } = state;

    this.toggleElement('registerBtn', !isAuthenticated);
    this.toggleElement('userAvatar', isAuthenticated);
    this.toggleElement('startGameBtn', isAuthenticated && !gameStarted);
    this.toggleElement('stopGameBtn', isAuthenticated && gameStarted);

    if (isAuthenticated && currentPlayerId !== null) {
      const avatarImg = document.querySelector('#userAvatar img') as HTMLImageElement | null;
      if (avatarImg) {
        const db = new GameDatabase();
        db.init().then(() => {
          const tx = db['db']!.transaction('players', 'readonly');
          const store = tx.objectStore('players');
          const request = store.get(currentPlayerId);

          request.onsuccess = () => {
            const player = request.result;
            if (player && player.email) {
              avatarImg.src = getGravatarUrl(player.email);
            }
          };
        });
      }
    }
  }

  private toggleElement(id: string, show: boolean): void {
    const element = document.getElementById(id);
    if (element) {
      if (show) {
        element.classList.remove('hidden');
      } else {
        element.classList.add('hidden');
      }
    }
  }
}

export const header = Header.getInstance();
