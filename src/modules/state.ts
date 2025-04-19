type AppStateType = {
  isAuthenticated: boolean;
  currentPlayerId: number | null;
  gameStarted: boolean;
};

class AppState {
  static state: AppStateType = {
    isAuthenticated: false,
    currentPlayerId: null,
    gameStarted: false
  };

  static getState(): AppStateType {
    return this.state;
  }

  static updateState(updates: Partial<AppStateType>): void {
    this.state = { ...this.state, ...updates };
    console.log('State updated:', this.state);  // Логирование состояния
    document.dispatchEvent(new CustomEvent('stateChanged'));
  }
}

export { AppState };
