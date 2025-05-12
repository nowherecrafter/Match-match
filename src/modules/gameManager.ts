// src/services/GameManager.ts
import { AppState } from "../services/state";
import { Timer } from '../components/timer';
import { GameDatabase } from "../services/db";
import { CardData } from "../components/card";
import { renderGameBoard } from '../components/gameBoard';
import { flipCard } from "../components/card";

export class GameManager {
  private timer: Timer;

  constructor() {
    this.timer = new Timer(this.updateGameTime);
  }

  async startGame() {
    if (AppState.getState().gameStarted) return;

    AppState.updateState({ gameStarted: true });
    this.timer.start();


    await this.generateGameBoard((card: CardData, event: MouseEvent) => {
      // Передаём event.target в flipCard

      console.log("Card clicked", card);
      const target = event.target as HTMLElement;
      flipCard(target);  // Теперь передаём целевой элемент
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

  private async generateGameBoard(onCardClick: (card: CardData, event: MouseEvent) => void): Promise<void> {
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
      `assets/images/${settings?.cardType}/Animal_${i + 1}.png`
    );
  
    let cards: CardData[] = [];
    images.forEach((image, i) => {
      cards.push(
        { id: i * 2, image, isFlipped: false, isMatched: false },
        { id: i * 2 + 1, image, isFlipped: false, isMatched: false }
      );
    });
  
    cards = this.shuffle(cards);
  
    renderGameBoard({
      cards,
      difficulty: settings?.difficulty || '4x4',
      onCardClick,
    });
  }

  
  

  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // обмен элементов
    }
    return array;
  }
}


