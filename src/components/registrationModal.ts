import { AppState } from '../modules/state';
import { GameDatabase } from '../services/db';
import { Player } from '../types';

export class RegistrationModal {
  private modalElement: HTMLDivElement;

  constructor() {
    this.modalElement = this.createModal();
    document.body.appendChild(this.modalElement);
    this.hide();
    this.setupEventListeners();
  }

  private validateName(name: string): boolean {
    const re = /^[A-Za-zА-Яа-яЁё\s'-]{1,30}$/;
    return re.test(name.trim());
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }

  private createModal(): HTMLDivElement {
    const div = document.createElement('div');
    div.classList.add('modalform');  // Изменили на modalform
    div.innerHTML = `
      <div class="modalform-backdrop"></div> <!-- Изменили на modalform-backdrop -->
      <div class="modalform-content"> <!-- Изменили на modalform-content -->
        <h2>Register</h2>
        <form id="registration-form">
          <input type="text" id="firstName" name="firstName" placeholder="First Name" required />
          <input type="text" id="lastName"  name="lastName"  placeholder="Last Name"  required />
          <input type="email" id="email"     name="email"     placeholder="Email"      required />
          <div class="modalform-buttons">
            <button type="submit">Register</button>
            <button type="button" class="modalform-close">Cancel</button>
          </div>
        </form>
      </div>
    `;
    return div;
  }

  private setupEventListeners(): void {
    this.modalElement.querySelector('.modalform-backdrop')!  // Изменили на modalform-backdrop
      .addEventListener('click', () => this.hide());
    this.modalElement.querySelector('.modalform-close')!
      .addEventListener('click', () => this.hide());
    this.modalElement.querySelector('#registration-form')!
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
    const fn = (form.querySelector('#firstName') as HTMLInputElement);
    const ln = (form.querySelector('#lastName')  as HTMLInputElement);
    const em = (form.querySelector('#email')     as HTMLInputElement);

    [fn, ln, em].forEach(i => i.classList.remove('input-error'));
    let valid = true;
    if (!this.validateName(fn.value)) { fn.classList.add('input-error'); valid = false; }
    if (!this.validateName(ln.value)) { ln.classList.add('input-error'); valid = false; }
    if (!this.validateEmail(em.value)) { em.classList.add('input-error'); valid = false; }
    if (!valid) return;

    try {
      const db = new GameDatabase();
      const id = await db.addPlayer({ firstName: fn.value, lastName: ln.value, email: em.value });
      AppState.updateState({ isAuthenticated: true, currentPlayerId: id });
      this.hide();
    } catch (err) {
      console.error('Registration failed:', err);
      alert('Error saving player, please try again.');
    }
  }
}
