import { AppState } from '../services/state';
import { GameDatabase } from '../services/db';
import { Player } from '../types';

export class LoginModal {
  private modalElement: HTMLDivElement;

  constructor() {
    this.modalElement = this.createModal();
    document.body.appendChild(this.modalElement);
    this.hide();
    this.setupEventListeners();
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }

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

  private setupEventListeners(): void {
    this.modalElement.querySelector('.modalform-backdrop')!
      .addEventListener('click', () => this.hide());
    this.modalElement.querySelector('.modalform-close')!
      .addEventListener('click', () => this.hide());
    this.modalElement.querySelector('#login-form')!
      .addEventListener('submit', (e) => this.handleSubmit(e));
  }

  public show(): void {
    this.modalElement.style.display = 'flex';
  }

  public hide(): void {
    this.modalElement.style.display = 'none';
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const em = (form.querySelector('#email') as HTMLInputElement);

    em.classList.remove('input-error');
    if (!this.validateEmail(em.value)) {
      em.classList.add('input-error');
      return;
    }

    try {
      const db = new GameDatabase();
      await db.init();
      const tx = (db as any).db.transaction('players', 'readonly');
      const store = tx.objectStore('players');
      const idx = store.index('email');
      const req = idx.get(em.value);

      req.onsuccess = () => {
        const player: Player = req.result;
        if (player?.id != null) {
          AppState.updateState({ isAuthenticated: true, currentPlayerId: player.id });
          this.hide();
        } else {
          alert('No player with this email.');
        }
      };
      req.onerror = () => alert('Error during login.');
    } catch (err) {
      console.error('Login failed:', err);
      alert('Login failed, please try again.');
    }
  }
}
