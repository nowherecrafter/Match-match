// src/services/GameManager.ts
import { AppState } from "../services/state";
import { Timer } from '../components/timer';
import { GameDatabase } from "../services/db";
import { createCard, CardData } from "../components/card";

export class GameManager {
  private timer: Timer;

  constructor() {
    this.timer = new Timer(this.updateGameTime);
  }

  async startGame() {
    if (AppState.getState().gameStarted) return;

    AppState.updateState({ gameStarted: true });
    this.timer.start();

    await this.generateGameBoard((card: CardData) => {
      // TODO: обработчик клика по карточке
      console.log("Card clicked", card);
    });
  }

  stopGame() {
    AppState.updateState({ gameStarted: false });
    this.timer.stop();
    this.timer.reset();
  }

  private updateGameTime(seconds: number) {
    AppState.updateState({ gameTime: seconds });
  }

private async generateGameBoard(onCardClick: (card: CardData) => void): Promise<void> {
  const db = new GameDatabase();
  await db.init();
  const settings = await db.getGameSettings();

  const difficultyMap: Record<string, number> = {
    '4x4': 16,
    '6x6': 36,
    '8x8': 64,
  };

  const cardCount = difficultyMap[settings?.difficulty] || 16;
  const uniqueCardCount = cardCount / 2;

  const images = Array.from({ length: uniqueCardCount }, (_, i) =>
    `assets/cards/${settings?.cardType.toLowerCase()}/${i + 1}.png`
  );

  let cards: CardData[] = [];
  images.forEach((image, i) => {
    cards.push(
      { id: i * 2, image, isFlipped: false, isMatched: false },
      { id: i * 2 + 1, image, isFlipped: false, isMatched: false }
    );
  });

  cards = this.shuffle(cards);

  const board = document.getElementById('gameBoard');
  if (board) {
    board.innerHTML = ''; // Очищаем поле перед добавлением новых карточек

    const cardsPerRow = settings?.difficulty === '4x4' ? 4 : settings?.difficulty === '6x6' ? 6 : 8;

    const numberOfRows = Math.ceil(cards.length / cardsPerRow);

    let row: HTMLDivElement | null = null;
    let cardIndex = 0;

    // Для каждой строки создаём новый ряд (row)
    for (let i = 0; i < numberOfRows; i++) {
      row = document.createElement('div');
      row.classList.add('row'); // Добавляем кастомный класс для отступов

      // Для каждой строки добавляем нужное количество колонок
      for (let j = 0; j < cardsPerRow && cardIndex < cards.length; j++) {
        const card = cards[cardIndex++];
        const cardElement = createCard({ card, onClick: onCardClick });
        const col = document.createElement('div');
        col.classList.add('col');
        col.appendChild(cardElement);
        row.appendChild(col);
      }

      board.appendChild(row); // Добавляем строку на доску
    }
  }
}

  
  

  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // обмен элементов
    }
    return array;
  }
}
