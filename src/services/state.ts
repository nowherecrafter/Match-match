type AppStateType = {
  isAuthenticated: boolean;
  currentPlayerId: number | null;
  gameStarted: boolean;
  gameTime: number;
};

class AppState {
  static state: AppStateType;

  static getState(): AppStateType {
    if (!this.state) {
      const saved = sessionStorage.getItem('appState');
      this.state = saved
        ? JSON.parse(saved)
        : {
            isAuthenticated: false,
            currentPlayerId: null,
            gameStarted: false,
            gameTime: 0,
          };
    }
    return this.state;
  }

  static updateState(updates: Partial<AppStateType>): void {
    this.state = { ...this.getState(), ...updates };
    sessionStorage.setItem('appState', JSON.stringify(this.state));
    document.dispatchEvent(new CustomEvent('stateChanged'));
  }
}

export { AppState };
