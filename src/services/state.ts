type AppStateType = {
  isAuthenticated: boolean;
  currentPlayerId: number | null;
  gameStarted: boolean;
  gameTime: number;
};

class AppState {
  // Internal cache of the state (always valid AppStateType)
  static state: AppStateType;

  /**
   * Returns the current app state, initializing from sessionStorage if needed.
   */
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

  /**
   * Updates the current state with partial changes, saves it, and dispatches an event.
   */
  static updateState(updates: Partial<AppStateType>): void {
    const current = this.getState();
    this.state = { ...current, ...updates };
    sessionStorage.setItem('appState', JSON.stringify(this.state));
    document.dispatchEvent(new CustomEvent('stateChanged'));
  }

  /**
   * Resets state to its default values and notifies subscribers.
   */
  static reset(): void {
    this.state = {
      isAuthenticated: false,
      currentPlayerId: null,
      gameStarted: false,
      gameTime: 0,
    };
    sessionStorage.setItem('appState', JSON.stringify(this.state));
    document.dispatchEvent(new CustomEvent('stateChanged'));
  }
}

export { AppState };
