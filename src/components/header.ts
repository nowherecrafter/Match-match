import { AppState } from '../services/state';
import { GameDatabase } from '../services/db';
import { RegistrationModal } from './registrationModal';
import { LoginModal } from './loginModal';
import md5 from 'md5';

/**
 * Generates a Gravatar URL from a user email.
 * Used for displaying the user's avatar based on their email hash.
 */
function getGravatarUrl(email: string, size = 40): string {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
}

/**
 * Singleton class responsible for rendering and controlling the main app header.
 * Includes logo, navigation, authentication buttons, and avatar.
 */
class Header {
  private static instance: Header;                // Singleton instance
  private element: HTMLElement;                   // Root header DOM element
  private isMounted = false;                      // Tracks whether header is already added to DOM

  private registrationModal = new RegistrationModal();  // Registration modal instance
  private loginModal = new LoginModal();                // Login modal instance

  private constructor() {
    this.element = this.createHeader();           // Create DOM structure
    this.setupEventListeners();                   // Bind button events
    this.subscribeToState();                      // Watch for global state changes
    this.updateUI(AppState.getState());           // Initial UI state
  }

  /**
   * Creates and returns the full header DOM structure.
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
   * Binds click listeners for all header buttons.
   */
  private setupEventListeners(): void {
    this.element.querySelector('#startGameBtn')?.addEventListener('click', () => {
      window.location.href = '/game'; // Redirect to game screen
    });

    this.element.querySelector('#stopGameBtn')?.addEventListener('click', () => {
      AppState.updateState({ gameStarted: false }); // Update global state
      window.location.href = '/about';              // Redirect to About
    });

    this.element.querySelector('#registerBtn')?.addEventListener('click', () => {
      this.registrationModal.show(); // Open registration modal
    });

    this.element.querySelector('#loginBtn')?.addEventListener('click', () => {
      this.loginModal.show(); // Open login modal
    });
  }

  /**
   * Subscribes to global application state changes.
   * Automatically updates UI when state changes.
   */
  private subscribeToState(): void {
    document.addEventListener('stateChanged', () => {
      this.updateUI(AppState.getState());
    });
  }

  /**
   * Mounts the header to the DOM, if not already mounted.
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
   * Updates visibility and content of header elements based on current app state.
   */
  public updateUI(state: typeof AppState.state): void {
    const { isAuthenticated, gameStarted, currentPlayerId } = state;

    // Show/hide buttons based on authentication/game state
    this.toggleElement('registerBtn', !isAuthenticated);
    this.toggleElement('loginBtn',    !isAuthenticated);
    this.toggleElement('userAvatar',   isAuthenticated);
    this.toggleElement('startGameBtn', isAuthenticated && !gameStarted);
    this.toggleElement('stopGameBtn',  isAuthenticated && gameStarted);

    // If user is logged in, load their avatar via email
    if (isAuthenticated && currentPlayerId !== null) {
      this.loadUserAvatar(currentPlayerId);
    }
  }

  /**
   * Shows or hides an element by ID.
   * @param id - ID of the element
   * @param show - Whether to show (true) or hide (false) it
   */
  private toggleElement(id: string, show: boolean): void {
    const el = document.getElementById(id);
    el?.classList.toggle('hidden', !show);
  }

  /**
   * Loads user email from IndexedDB and sets avatar image using Gravatar.
   * @param playerId - ID of the currently logged-in player
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
        avatarImg.src = getGravatarUrl(player.email); // Use Gravatar avatar
      }
    };
  }

  /**
   * Returns a singleton instance of the Header.
   */
  public static getInstance(): Header {
    if (!Header.instance) {
      Header.instance = new Header();
    }
    return Header.instance;
  }
}

export const header = Header.getInstance();
