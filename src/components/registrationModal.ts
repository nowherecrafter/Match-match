import { AppState } from '../services/state';
import { GameDatabase } from '../services/db';
import { Player } from '../types';

/**
 * Modal component for registering a new player.
 */
export class RegistrationModal {
  private modalElement: HTMLDivElement;

  constructor() {
    this.modalElement = this.createModal();
    document.body.appendChild(this.modalElement);
    this.hide();
    this.setupEventListeners();
  }

  /**
   * Validates names (first/last) using a character regex.
   */
  private validateName(name: string): boolean {
    const re = /^[A-Za-zА-Яа-яЁё\s'-]{1,30}$/;
    return re.test(name.trim());
  }

  /**
   * Validates the email format.
   */
  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }

  /**
   * Creates modal HTML structure.
   */
  private createModal(): HTMLDivElement {
    const div = document.createElement('div');
    div.classList.add('modalform');
    div.innerHTML = `
      <div class="modalform-backdrop"></div>
      <div class="modalform-content">
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

  /**
   * Adds event listeners to modal elements.
   */
  private setupEventListeners(): void {
    this.modalElement.querySelector('.modalform-backdrop')?.addEventListener('click', () => this.hide());
    this.modalElement.querySelector('.modalform-close')?.addEventListener('click', () => this.hide());
    this.modalElement.querySelector('#registration-form')?.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  /**
   * Shows the modal.
   */
  public show(): void {
    this.modalElement.style.display = 'flex';
  }

  /**
   * Hides the modal.
   */
  public hide(): void {
    this.modalElement.style.display = 'none';
  }

  /**
   * Handles form submission and player creation.
   */
  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    const firstNameInput = form.querySelector<HTMLInputElement>('#firstName');
    const lastNameInput  = form.querySelector<HTMLInputElement>('#lastName');
    const emailInput     = form.querySelector<HTMLInputElement>('#email');

    if (!firstNameInput || !lastNameInput || !emailInput) return;

    const firstName = firstNameInput.value.trim();
    const lastName  = lastNameInput.value.trim();
    const email     = emailInput.value.trim();

    // Clear previous errors
    [firstNameInput, lastNameInput, emailInput].forEach(i => i.classList.remove('input-error'));

    let valid = true;
    if (!this.validateName(firstName)) { firstNameInput.classList.add('input-error'); valid = false; }
    if (!this.validateName(lastName))  { lastNameInput.classList.add('input-error');  valid = false; }
    if (!this.validateEmail(email))    { emailInput.classList.add('input-error');     valid = false; }

    if (!valid) return;

    try {
      const db = new GameDatabase();
      const id = await db.addPlayer({ firstName, lastName, email });
      AppState.updateState({ isAuthenticated: true, currentPlayerId: id });
      this.hide();
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Error saving player, please try again.');
    }
  }
}
