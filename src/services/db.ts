import { Player, GameResult } from '../types';

export class GameDatabase {
  private readonly dbName = 'memory-game';
  private db: IDBDatabase | null = null;

  private predefinedPlayers: Player[] = [
    { id: 1, firstName: 'Noe', lastName: 'Ware', email: 'nowherecrafter@gmail.com' },
    { id: 2, firstName: 'Ivan', lastName: 'Derban', email: 'ivan.derban.dev@gmail.com' },
  ];

  private predefinedResults: GameResult[] = [
    { playerId: 1, score: 5000, time: 120, date: new Date(), difficulty: '4x4', cardType: 'classic' },
    { playerId: 2, score: 4700, time: 110, date: new Date(), difficulty: '4x4', cardType: 'classic' },
  ];

  // Инициализация базы данных
  public async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const dbRequest = indexedDB.open(this.dbName, 2);  // Увеличиваем версию базы данных

      dbRequest.onerror = () => reject('An error occurred during opening the database');

      dbRequest.onsuccess = () => {
        this.db = dbRequest.result;
        resolve();
      };

      dbRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBRequest<IDBDatabase>).result;

        // Создаем объект хранилища для игроков
        if (!db.objectStoreNames.contains('players')) {
          const playersStore = db.createObjectStore('players', {
            keyPath: 'id',
            autoIncrement: true, // ID autogeneration
          });
          playersStore.createIndex('email', 'email', { unique: true });
        }

        // Создаем объект хранилища для результатов игры
        if (!db.objectStoreNames.contains('results')) {
          const resultsStore = db.createObjectStore('results', {
            keyPath: 'id',
            autoIncrement: true, // ID autogeneration
          });
          resultsStore.createIndex('playerId', 'playerId', { unique: false });
          resultsStore.createIndex('score', 'score', { unique: false });
          resultsStore.createIndex('date', 'date', { unique: false });
        }

        // Создаем объект хранилища для настроек игры
        if (!db.objectStoreNames.contains('settings')) {
          const settingsStore = db.createObjectStore('settings', {
            keyPath: 'name',
          });
          settingsStore.createIndex('name', 'name', { unique: true });
        }

        const target = event.target as IDBRequest<IDBDatabase>;
        target.onsuccess = () => {
          this.db = target.result;
          resolve();
        };
      };
    });
  }

  // Ожидание и проверка базы данных
  private async ensureDb(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  // Добавление игрока
  public async addPlayer(player: Omit<Player, 'id'>): Promise<number> {
    await this.ensureDb();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('players', 'readwrite');
      const store = tx.objectStore('players');
      const request = store.add(player);

      request.onsuccess = () => resolve(request.result as number); // Возвращаем сгенерированный ID
      request.onerror = () => reject('An error occurred while saving the player');
    });
  }

  // Добавление результата игры
  public async addGameResult(result: GameResult): Promise<number> {
    await this.ensureDb();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('results', 'readwrite');
      const store = tx.objectStore('results');
      const request = store.add(result);

      request.onsuccess = () => resolve(request.result as number); // Возвращаем сгенерированный ID
      request.onerror = () => reject('An error occurred while saving the game result');
    });
  }

  // Добавление настроек игры
  public async addGameSettings(settings: { cardType: string, difficulty: string }): Promise<void> {
    await this.ensureDb();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const request = store.put({ name: 'gameSettings', ...settings }); // Сохраняем настройки с уникальным ключом

      request.onsuccess = () => resolve();
      request.onerror = () => reject('An error occurred while saving the game settings');
    });
  }

  // Получение настроек игры
  public async getGameSettings(): Promise<any | null> {
    await this.ensureDb();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const request = store.get('gameSettings'); // Получаем настройки по имени

      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject('An error occurred while fetching the game settings');
    });
  }

  // Получение игрока по email
  public async getPlayerByEmail(email: string): Promise<any | null> {
    await this.ensureDb();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('players', 'readonly');
      const store = tx.objectStore('players');
      const index = store.index('email');
      const request = index.get(email);

      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject('An error occurred while fetching the player');
    });
  }

public async getTopPlayers(limit = 10): Promise<Array<GameResult & { player: Player | null }>> {
  await this.ensureDb();

  return new Promise((resolve, reject) => {
    const tx = this.db!.transaction(['players', 'results'], 'readonly');
    const resultsStore = tx.objectStore('results');
    const playersStore = tx.objectStore('players');
    const scoreIndex = resultsStore.index('score');

    const topResults: Array<GameResult & { player: Player | null }> = [];

    const request = scoreIndex.openCursor(null, 'prev'); // Сортировка по убыванию score

    request.onsuccess = (event) => {
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
      }

      // Если курсор завершён досрочно
      if (!cursor) {
        resolve(topResults);
      }
    };

    request.onerror = () => reject('Error fetching top players');
  });
}

}
