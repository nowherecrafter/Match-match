import { AppState } from '../services/state';
import { GameDatabase } from '../services/db';
import { RegistrationModal } from './registrationModal';
import { LoginModal } from './loginModal';
import md5 from 'md5';

/**
 * Generates a Gravatar URL from a user email.
 */
function getGravatarUrl(email: string, size = 40): string {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
}

class Header {
  private static instance: Header;
  private element: HTMLElement;
  private isMounted = false;

  private registrationModal = new RegistrationModal();
  private loginModal = new LoginModal();

  private constructor() {
    this.element = this.createHeader();
    this.setupEventListeners();
    this.subscribeToState();
    this.updateUI(AppState.getState());
  }

  /**
   * Creates and returns the header DOM element.
   */
  private createHeader(): HTMLElement {
    const header = document.createElement('header');
    header.className = 'game-header';

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
        <button class="btn btn--login hidden"    id="loginBtn">Login</button>
        <button class="btn btn--start hidden"    id="startGameBtn">Start Game</button>
        <button class="btn btn--stop hidden"     id="stopGameBtn">End Game</button>
        <div class="user-avatar hidden"          id="userAvatar">
          <img src="assets/default-avatar.png" alt="User">
        </div>
      </div>
    `;
    return header;
  }

  /**
   * Binds event listeners for all header controls.
   */
  private setupEventListeners(): void {
    this.element.querySelector('#startGameBtn')?.addEventListener('click', () => {
      window.location.href = '/game';
    });

    this.element.querySelector('#stopGameBtn')?.addEventListener('click', () => {
      AppState.updateState({ gameStarted: false });
      window.location.href = '/about';
    });

    this.element.querySelector('#registerBtn')?.addEventListener('click', () => {
      this.registrationModal.show();
    });

    this.element.querySelector('#loginBtn')?.addEventListener('click', () => {
      this.loginModal.show();
    });
  }

  /**
   * Subscribes to app state changes.
   */
  private subscribeToState(): void {
    document.addEventListener('stateChanged', () => {
      this.updateUI(AppState.getState());
    });
  }

  /**
   * Mounts the header into the DOM, only once.
   */
  public mount(containerId = 'header-container'): void {
    if (this.isMounted) return;
    const container = document.getElementById(containerId);
    if (container) {
      container.appendChild(this.element);
      this.isMounted = true;
    }
  }

  /**
   * Updates UI elements based on the current app state.
   */
  public updateUI(state: typeof AppState.state): void {
    const { isAuthenticated, gameStarted, currentPlayerId } = state;

    this.toggleElement('registerBtn', !isAuthenticated);
    this.toggleElement('loginBtn',    !isAuthenticated);
    this.toggleElement('userAvatar',   isAuthenticated);
    this.toggleElement('startGameBtn', isAuthenticated && !gameStarted);
    this.toggleElement('stopGameBtn',  isAuthenticated && gameStarted);

    if (isAuthenticated && currentPlayerId !== null) {
      this.loadUserAvatar(currentPlayerId);
    }
  }

  /**
   * Dynamically shows or hides an element by ID.
   */
  private toggleElement(id: string, show: boolean): void {
    const el = document.getElementById(id);
    el?.classList.toggle('hidden', !show);
  }

  /**
   * Loads the user avatar using Gravatar, if available.
   */
  private async loadUserAvatar(playerId: number): Promise<void> {
    const avatarImg = document.querySelector('#userAvatar img') as HTMLImageElement | null;
    if (!avatarImg) return;

    const db = new GameDatabase();
    await db.init();

    const tx = (db as any).db.transaction('players', 'readonly');
    const store = tx.objectStore('players');
    const request = store.get(playerId);

    request.onsuccess = () => {
      const player = request.result;
      if (player?.email) {
        avatarImg.src = getGravatarUrl(player.email);
      }
    };
  }

  public static getInstance(): Header {
    if (!Header.instance) {
      Header.instance = new Header();
    }
    return Header.instance;
  }
}

export const header = Header.getInstance();
