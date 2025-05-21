import { AppState } from "../services/state";
import { Timer } from '../components/timer';
import { GameDatabase } from "../services/db";
import {
  CardData,
  flipCard,
  unflipCard,
  markAsMatched,
  markAsUnmatched,
  clearUnmatched,
} from "../components/card";
import { renderGameBoard } from '../components/gameBoard';
import { GameOverOverlay } from '../components/gameOverOverlay';

export class GameManager {
  private timer: Timer;
  private intervalId: number | null = null;
  private gameTime: number = 0;

  private flippedCards: CardData[] = [];
  private openedCardElements: HTMLElement[] = [];
  private comparisonsCount = 0;
  private wrongComparisonsCount = 0;
  private cards: CardData[] = [];

  constructor() {
    this.timer = new Timer();

    // Subscribe to state changes (assuming AppState supports events)
    document.addEventListener('stateChanged', () => {
      const { gameTime } = AppState.getState();
      this.timer.render(gameTime || 0);
    });
  }

  async startGame() {
    if (AppState.getState().gameStarted) return;

    this.comparisonsCount = 0;
    this.wrongComparisonsCount = 0;
    this.gameTime = 0;
    AppState.updateState({ gameStarted: true, gameTime: 0 });
    this.startTimer();

    await this.generateGameBoard((card: CardData, event: MouseEvent) => {
      if (this.flippedCards.length >= 2 || card.isFlipped || card.isMatched) return;

      const target = event.target as HTMLElement;
      flipCard(target);
      card.isFlipped = true;

      this.flippedCards.push(card);
      this.openedCardElements.push(target);

      if (this.flippedCards.length === 2) {
        this.comparisonsCount++;
        this.checkForMatch();
      }
    });
  }

  stopGame() {
    AppState.updateState({ gameStarted: false });
    this.stopTimer();
    AppState.updateState({ gameTime: 0 });
    this.flippedCards = [];
    this.openedCardElements = [];
  }

  private startTimer() {
    if (this.intervalId !== null) return;

    this.intervalId = window.setInterval(() => {
      this.gameTime++;
      AppState.updateState({ gameTime: this.gameTime });
    }, 1000);
  }

  private stopTimer() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private checkForMatch() {
    const [card1, card2] = this.flippedCards;
    const [element1, element2] = this.openedCardElements;

    if (card1.id === card2.id && element1 !== element2) {
      card1.isMatched = true;
      card2.isMatched = true;

      markAsMatched(element1);
      markAsMatched(element2);

      this.flippedCards = [];
      this.openedCardElements = [];

      if (this.isGameOver()) {
        this.finishGame();
      }
    } else {
      this.wrongComparisonsCount++;
      markAsUnmatched(element1);
      markAsUnmatched(element2);

      setTimeout(() => {
        unflipCard(element1);
        unflipCard(element2);

        clearUnmatched(element1);
        clearUnmatched(element2);

        card1.isFlipped = false;
        card2.isFlipped = false;

        this.flippedCards = [];
        this.openedCardElements = [];
      }, 1000);
    }
  }

  private isGameOver(): boolean {
    return this.cards.length > 0 && this.cards.every(card => card.isMatched);
  }

  private async finishGame() {
    this.stopTimer();
    AppState.updateState({ gameStarted: false });

    const { gameTime } = AppState.getState();

    const score =
      Math.max(0, (this.comparisonsCount - this.wrongComparisonsCount) * 100 - gameTime * 10);

    const db = new GameDatabase();
    await db.init();

    const playerId = AppState.getState().currentPlayerId;
    if (playerId !== null) {
      await db.addGameResult({
        playerId,
        score,
        time: gameTime,
        date: new Date(),
        difficulty: (await db.getGameSettings())?.difficulty || '4x4',
        cardType: (await db.getGameSettings())?.cardType || 'classic',
      });
    }

    GameOverOverlay.show(score);
  }

  private async generateGameBoard(
    onCardClick: (card: CardData, event: MouseEvent) => void
  ): Promise<void> {
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
        { id: i, image, isFlipped: false, isMatched: false },
        { id: i, image, isFlipped: false, isMatched: false }
      );
    });

    cards = this.shuffle(cards);
    this.cards = cards;

    renderGameBoard({
      cards,
      difficulty: settings?.difficulty || '4x4',
      onCardClick,
    });
  }

  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
