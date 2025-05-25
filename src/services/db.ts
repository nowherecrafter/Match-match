import { Player, GameResult } from '../types';

export class GameDatabase {
  private readonly dbName = 'memory-game';
  private db: IDBDatabase | null = null;

  private readonly stores = {
    players: 'players',
    results: 'results',
    settings: 'settings',
  };

  private predefinedPlayers: Player[] = [
    { id: 1, firstName: 'Noe', lastName: 'Ware', email: 'nowherecrafter@gmail.com' },
    { id: 2, firstName: 'Ivan', lastName: 'Derban', email: 'ivan.derban.dev@gmail.com' },
  ];

  private predefinedResults: GameResult[] = [
    { playerId: 1, score: 5000, time: 120, date: new Date(), difficulty: '4x4', cardType: 'classic' },
    { playerId: 2, score: 4700, time: 110, date: new Date(), difficulty: '4x4', cardType: 'classic' },
  ];

  /**
   * Initialize the database and object stores.
   */
  public async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const dbRequest = indexedDB.open(this.dbName, 2);

      dbRequest.onerror = () => reject(new Error('An error occurred during opening the database'));

      dbRequest.onsuccess = () => {
        this.db = dbRequest.result;
        resolve();
      };

      dbRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBRequest<IDBDatabase>).result;

        if (!db.objectStoreNames.contains(this.stores.players)) {
          const playersStore = db.createObjectStore(this.stores.players, {
            keyPath: 'id',
            autoIncrement: true,
          });
          playersStore.createIndex('email', 'email', { unique: true });

          playersStore.transaction!.oncomplete = () => {
            const tx = db.transaction(this.stores.players, 'readwrite');
            const store = tx.objectStore(this.stores.players);
            this.predefinedPlayers.forEach(player => store.add(player));
          };
        }

        if (!db.objectStoreNames.contains(this.stores.results)) {
          const resultsStore = db.createObjectStore(this.stores.results, {
            keyPath: 'id',
            autoIncrement: true,
          });
          resultsStore.createIndex('playerId', 'playerId', { unique: false });
          resultsStore.createIndex('score', 'score', { unique: false });
          resultsStore.createIndex('date', 'date', { unique: false });

          resultsStore.transaction!.oncomplete = () => {
            const tx = db.transaction(this.stores.results, 'readwrite');
            const store = tx.objectStore(this.stores.results);
            this.predefinedResults.forEach(result => store.add(result));
          };
        }

        if (!db.objectStoreNames.contains(this.stores.settings)) {
          const settingsStore = db.createObjectStore(this.stores.settings, {
            keyPath: 'name',
          });
          settingsStore.createIndex('name', 'name', { unique: true });
        }

        this.db = db;
        resolve();
      };
    });
  }

  /**
   * Ensure the database is initialized.
   */
  private async ensureDb(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  /**
   * Generic helper to run an IndexedDB transaction.
   */
  private async runTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest
  ): Promise<T> {
    await this.ensureDb();

    return new Promise<T>((resolve, reject) => {
      const tx = this.db!.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(new Error(`Transaction failed on store "${storeName}"`));
    });
  }

  /**
   * Add a new player.
   */
  public addPlayer(player: Omit<Player, 'id'>): Promise<number> {
    return this.runTransaction<number>(this.stores.players, 'readwrite', store => store.add(player));
  }

  /**
   * Add a game result.
   */
  public addGameResult(result: GameResult): Promise<number> {
    return this.runTransaction<number>(this.stores.results, 'readwrite', store => store.add(result));
  }

  /**
   * Save game settings.
   */
  public addGameSettings(settings: { cardType: string; difficulty: string }): Promise<void> {
    return this.runTransaction<void>(this.stores.settings, 'readwrite', store =>
      store.put({ name: 'gameSettings', ...settings })
    );
  }

  /**
   * Get saved game settings.
   */
  public async getGameSettings(): Promise<{ cardType: string; difficulty: string } | null> {
    return this.runTransaction(this.stores.settings, 'readonly', store => store.get('gameSettings'));
  }

  /**
   * Get a player by email.
   */
  public async getPlayerByEmail(email: string): Promise<Player | null> {
    await this.ensureDb();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(this.stores.players, 'readonly');
      const store = tx.objectStore(this.stores.players);
      const index = store.index('email');
      const request = index.get(email);

      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(new Error('An error occurred while fetching the player'));
    });
  }

  /**
   * Get top players by highest scores, including player data.
   */
  public async getTopPlayers(limit = 10): Promise<Array<GameResult & { player: Player | null }>> {
    await this.ensureDb();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.stores.players, this.stores.results], 'readonly');
      const resultsStore = tx.objectStore(this.stores.results);
      const playersStore = tx.objectStore(this.stores.players);
      const scoreIndex = resultsStore.index('score');

      const topResults: Array<GameResult & { player: Player | null }> = [];

      const request = scoreIndex.openCursor(null, 'prev');

      request.onsuccess = async (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

        if (cursor && topResults.length < limit) {
          const result = cursor.value as GameResult;
          const playerRequest = playersStore.get(result.playerId);

          playerRequest.onsuccess = () => {
            const player = playerRequest.result ?? null;
            topResults.push({ ...result, player });

            if (topResults.length < limit) {
              cursor.continue();
            } else {
              resolve(topResults);
            }
          };

          playerRequest.onerror = () => {
            topResults.push({ ...result, player: null });
            if (topResults.length < limit) {
              cursor.continue();
            } else {
              resolve(topResults);
            }
          };
        } else if (!cursor) {
          resolve(topResults);
        }
      };

      request.onerror = () => reject(new Error('Error fetching top players'));
    });
  }
}
