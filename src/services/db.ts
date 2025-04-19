import { Player, GameResult } from '../types';

export class GameDatabase {
  private readonly dbName = 'memory-game';
  private db: IDBDatabase | null = null;

  // DB initialization
  public async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject('An error occurred during opening the database');

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('players')) {
          const store = db.createObjectStore('players', {
            keyPath: 'id',
            autoIncrement: true // ID autogeneration
          });
          store.createIndex('email', 'email', { unique: true });
        }

        if (!db.objectStoreNames.contains('results')) {
          const store = db.createObjectStore('results', {
            keyPath: 'id',
            autoIncrement: true // ID autogeneration
          });
          store.createIndex('playerId', 'playerId', { unique: false });
          store.createIndex('score', 'score', { unique: false });
          store.createIndex('date', 'date', { unique: false });
        }
      };
    });
  }

  // Adding a player
  public async addPlayer(player: Omit<Player, 'id'>): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('players', 'readwrite');
      const store = tx.objectStore('players');

      const request = store.add(player);

      request.onsuccess = () => resolve(request.result as number); // Returning a generated ID
      request.onerror = () => reject('An error occurred while saving the player');
    });
  }

  // Adding a game result
  public async addGameResult(result: GameResult): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('results', 'readwrite');
      const store = tx.objectStore('results');

      const request = store.add(result);

      request.onsuccess = () => resolve(request.result as number); // Returning a generated ID
      request.onerror = () => reject('An error occurred while saving the game result');
    });
  }

  // Get the top players
  public async getTopPlayers(limit = 10): Promise<Player[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['players', 'results'], 'readonly');
      const playersStore = tx.objectStore('players');
      const resultsStore = tx.objectStore('results');

      // Sorting results by descending score using the 'score' index
      const scoreIndex = resultsStore.index('score');
      const request = scoreIndex.openCursor(null, 'prev'); // Sorting in descending order

      const topPlayersMap = new Map<number, { player: Player; bestScore: number }>(); // Store the best score for each player

      const topPlayers: Player[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && topPlayers.length < limit) {
          const result = cursor.value as GameResult;

          // If the player is not already in the top list, add them
          if (!topPlayersMap.has(result.playerId)) {
            topPlayersMap.set(result.playerId, { player: null as unknown as Player, bestScore: result.score });

            // Retrieve the player data using playerId
            const playerRequest = playersStore.get(result.playerId);
            playerRequest.onsuccess = () => {
              const player = playerRequest.result;
              if (player) {
                topPlayersMap.set(result.playerId, { player, bestScore: result.score });
              }

              // Continue to the next cursor entry
              cursor.continue();
            };
          } else {
            const playerData = topPlayersMap.get(result.playerId);
            if (playerData && result.score > playerData.bestScore) {
              playerData.bestScore = result.score;
            }
            cursor.continue();
          }
        } else {
          // Map contains top players, resolve the results
          topPlayersMap.forEach((value) => {
            topPlayers.push(value.player);
          });

          resolve(topPlayers);
        }
      };

      request.onerror = () => reject('Error fetching top players');
    });
  }
}
