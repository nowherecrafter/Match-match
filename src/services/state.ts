type AppStateType = {
  isAuthenticated: boolean;  // Состояние аутентификации
  currentPlayerId: number | null;  // ID текущего игрока
  gameStarted: boolean;  // Началась ли игра?
  gameTime: number;  // Время игры в секундах
};

class AppState {
  static state: AppStateType = {
    isAuthenticated: false,
    currentPlayerId: null,
    gameStarted: false,
    gameTime: 0,  // Изначально 0 секунд
  };

  static getState(): AppStateType {
    return this.state;
  }

  static updateState(updates: Partial<AppStateType>): void {
    this.state = { ...this.state, ...updates };
    console.log('State updated:', this.state);  // Логирование состояния
    document.dispatchEvent(new CustomEvent('stateChanged'));  // Триггер обновления UI
  }
}

export { AppState };
