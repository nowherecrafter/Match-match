import { AppState } from '../modules/state';           // Для обновления состояния
import { GameDatabase } from '../services/db';         // Для работы с базой данных
import { Player } from '../types';                      // Для работы с типами игроков


export class RegistrationModal {
    private modalElement: HTMLDivElement | null = null;
  
    constructor() {
      this.createModal();
  }
  
  private validateName(name: string): boolean {
    const nameRegex = /^[A-Za-zА-Яа-яЁё\s'-]{1,30}$/;
    return nameRegex.test(name.trim());
  }
  
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }
  
  private createModal() {
    this.modalElement = document.createElement('div');
    this.modalElement.classList.add('registration-modal');
    this.modalElement.innerHTML = `
      <div class="registration-backdrop"></div>
      <div class="registration-content">
        <h2>Register</h2>
        <form id="registration-form">
          <input type="text" id="firstName" name="firstName" placeholder="First Name" required />
          <input type="text" id="lastName" name="lastName" placeholder="Last Name" required />
          <input type="email" id="email" name="email" placeholder="Email" required />
          <div class="form-buttons">
            <button type="submit" class="btn btn-primary">Register</button>
            <button type="button" id="close-modal" class="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    `;
  
    document.body.appendChild(this.modalElement);
  
    // Правильное подключение событий
    const closeButton = this.modalElement.querySelector('#close-modal');
    closeButton?.addEventListener('click', () => this.hide());
  
    const form = this.modalElement.querySelector('#registration-form') as HTMLFormElement;
    form?.addEventListener('submit', (e) => this.handleSubmit(e)); // ← вот это важно
  }
  
  
    public show() {
      if (this.modalElement) {
        this.modalElement.style.display = 'flex';
      }
    }
  
    public hide() {
      if (this.modalElement) {
        this.modalElement.style.display = 'none';
      }
    }
  
    private async handleSubmit(event: Event) {
      event.preventDefault();
    
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
    
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const email = formData.get('email') as string;
    
      // Очищаем предыдущие ошибки
      form.querySelectorAll('input').forEach((input) => {
        input.classList.remove('input-error');
      });
    
      let isValid = true;
    
      // Валидируем поля
      if (!this.validateName(firstName)) {
        isValid = false;
        form.querySelector('#firstName')?.classList.add('input-error');
      }
      if (!this.validateName(lastName)) {
        isValid = false;
        form.querySelector('#lastName')?.classList.add('input-error');
      }
      if (!this.validateEmail(email)) {
        isValid = false;
        form.querySelector('#email')?.classList.add('input-error');
      }
    
      if (!isValid) {
        return; // Если есть ошибки, не отправляем форму
      }
    
      try {
        // Всё валидно: создаём игрока
        const db = new GameDatabase();
        const playerId = await db.addPlayer({ firstName, lastName, email });
    
        // Обновляем состояние
        AppState.updateState({ isAuthenticated: true, currentPlayerId: playerId });
    
        this.hide(); // Скрываем модалку после успешной регистрации
      } catch (error) {
        // Обрабатываем ошибку при добавлении игрока
        console.error('Registration failed:', error);
        alert('An error occurred while saving the player. Please try again.');
      }
    }
    
    
    
    
  }
  