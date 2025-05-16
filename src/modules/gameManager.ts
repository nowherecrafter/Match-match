import { AppState } from "../services/state";
import { Timer } from '../components/timer';
import { GameDatabase } from "../services/db";
import { GameOverOverlay } from '../components/gameOverOverlay';
import {
  CardData,
  flipCard,
  unflipCard,
  markAsMatched,
  markAsUnmatched,
  clearUnmatched
} from "../components/card";
import { renderGameBoard } from '../components/gameBoard';

export class GameManager {
  private timer: Timer;
  private flippedCards: CardData[] = [];
  private openedCardElements: HTMLElement[] = [];
  private matchedCount = 0;
  private totalCards = 0;
  private totalComparisons = 0;
  private errorComparisons = 0;
  private db = new GameDatabase();

  constructor() {
    this.timer = new Timer(this.updateGameTime);
  }

  async startGame() {
    if (AppState.getState().gameStarted) return;

    AppState.updateState({ gameStarted: true });
    this.timer.start();

    await this.generateGameBoard((card: CardData, event: MouseEvent) => {
      if (this.flippedCards.length >= 2 || card.isFlipped || card.isMatched) return;

      const target = event.target as HTMLElement;
      flipCard(target);
      card.isFlipped = true;

      this.flippedCards.push(card);
      this.openedCardElements.push(target);

      if (this.flippedCards.length === 2) {
        this.totalComparisons++;
        this.checkForMatch();
      }
    });
  }

  stopGame() {
    AppState.updateState({ gameStarted: false });
    this.timer.stop();
    this.timer.reset();
    this.flippedCards = [];
    this.openedCardElements = [];
    this.matchedCount = 0;
    this.totalComparisons = 0;
    this.errorComparisons = 0;
  }

  private async checkForMatch() {
    const [card1, card2] = this.flippedCards;
    const [element1, element2] = this.openedCardElements;

    if (card1.id === card2.id && element1 !== element2) {
      card1.isMatched = true;
      card2.isMatched = true;

      markAsMatched(element1);
      markAsMatched(element2);

      this.flippedCards = [];
      this.openedCardElements = [];
      this.matchedCount += 2;

      if (this.matchedCount === this.totalCards) {
        await this.finishGame();
      }
    } else {
      markAsUnmatched(element1);
      markAsUnmatched(element2);
      this.errorComparisons++;

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

  private updateGameTime = (seconds: number) => {
    AppState.updateState({ gameTime: seconds });
  };

  private async generateGameBoard(
    onCardClick: (card: CardData, event: MouseEvent) => void
  ): Promise<void> {
    await this.db.init();
    const settings = await this.db.getGameSettings();

    const difficultyMap: Record<string, number> = {
      '4x4': 16,
      '6x6': 36,
      '8x8': 64,
    };

    const cardCount = difficultyMap[settings?.difficulty] || 16;
    const uniqueCardCount = cardCount / 2;
    this.totalCards = cardCount;

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

  private async finishGame() {
    this.timer.stop();
    AppState.updateState({ gameStarted: false });

    const { gameTime, currentPlayerId } = AppState.getState();
    let score = (this.totalComparisons - this.errorComparisons) * 100 - gameTime * 10;
    score = Math.max(score, 0);

    const settings = await this.db.getGameSettings();

    if (currentPlayerId) {
      await this.db.addGameResult({
        playerId: currentPlayerId,
        score,
        time: gameTime,
        date: new Date(),
        difficulty: settings?.difficulty || 'unknown',
        cardType: settings?.cardType || 'unknown',
      });
    }

    const app = document.getElementById('app');
    if (app) {
      const overlay = new GameOverOverlay(score, () => {
        window.location.href = '/best-score';
      });
      overlay.show(app);
    }
  }
}
