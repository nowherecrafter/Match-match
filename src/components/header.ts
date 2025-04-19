import { AppState } from "../modules/state"; // Импорт AppState

class Header {
  private static instance: Header;
  private element: HTMLElement;
  private isMounted = false;

  private constructor() {
    this.element = this.createHeader();
    this.setupEventListeners();
    this.subscribeToState();
    this.updateUI(AppState.getState());  // Вызов метода для начальной настройки состояния
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
    const { isAuthenticated, gameStarted } = state;
  
    // Обновление видимости кнопок в зависимости от состояния
    this.toggleElement('registerBtn', !isAuthenticated);
    this.toggleElement('userAvatar', isAuthenticated);
    this.toggleElement('startGameBtn', isAuthenticated && !gameStarted);
    this.toggleElement('stopGameBtn', isAuthenticated && gameStarted);
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
