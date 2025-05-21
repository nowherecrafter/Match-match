import { AppState } from '../services/state';
import { GameDatabase } from '../services/db';
import { Player } from '../types';

/**
 * Modal component for user login by email.
 */
export class LoginModal {
  private modalElement: HTMLDivElement;

  constructor() {
    this.modalElement = this.createModal();
    document.body.appendChild(this.modalElement);
    this.hide();
    this.setupEventListeners();
  }

  /**
   * Validates email format using regex.
   */
  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }

  /**
   * Constructs the modal's HTML structure.
   */
  private createModal(): HTMLDivElement {
    const div = document.createElement('div');
    div.classList.add('modalform');
    div.innerHTML = `
      <div class="modalform-backdrop"></div>
      <div class="modalform-content">
        <h2>Login</h2>
        <form id="login-form">
          <input type="email" id="email" name="email" placeholder="Email" required />
          <div class="modalform-buttons">
            <button type="submit">Login</button>
            <button type="button" class="modalform-close">Cancel</button>
          </div>
        </form>
      </div>
    `;
    return div;
  }

  /**
   * Sets up all relevant event listeners for modal interactivity.
   */
  private setupEventListeners(): void {
    this.modalElement.querySelector('.modalform-backdrop')?.addEventListener('click', () => this.hide());
    this.modalElement.querySelector('.modalform-close')?.addEventListener('click', () => this.hide());
    this.modalElement.querySelector('#login-form')?.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  /**
   * Displays the login modal.
   */
  public show(): void {
    this.modalElement.style.display = 'flex';
  }

  /**
   * Hides the login modal.
   */
  public hide(): void {
    this.modalElement.style.display = 'none';
  }

  /**
   * Handles the login form submission and authentication.
   */
  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const emailInput = form.querySelector<HTMLInputElement>('#email');
    if (!emailInput) return;

    const email = emailInput.value.trim();
    emailInput.classList.remove('input-error');

    if (!this.validateEmail(email)) {
      emailInput.classList.add('input-error');
      return;
    }

    try {
      const db = new GameDatabase();
      await db.init();

      const tx = (db as any).db.transaction('players', 'readonly');
      const store = tx.objectStore('players');
      const index = store.index('email');
      const request = index.get(email);

      request.onsuccess = () => {
        const player: Player = request.result;
        if (player?.id != null) {
          AppState.updateState({ isAuthenticated: true, currentPlayerId: player.id });
          this.hide();
        } else {
          alert('No player with this email.');
        }
      };

      request.onerror = () => {
        alert('Error during login.');
      };
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed, please try again.');
    }
  }
}
