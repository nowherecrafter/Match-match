import { AppState } from '../services/state'; // Обновление состояния игры
import { Timer } from '../components/timer';     // Таймер для отслеживания времени
import { CardData } from '../components/card';   // Тип данных карты

class GameManager {
  private static instance: GameManager;
  private timer: Timer;
  private cards: CardData[] = [];
  private flippedCards: CardData[] = [];

  private constructor() {
    // Инициализация таймера
    this.timer = new Timer(this.updateGameTime);
  }

  // Получение экземпляра GameManager
  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  // Запуск игры
  public startGame(): void {
    // Обновление состояния через AppState
    AppState.updateState({ gameStarted: true, gameTime: 0 });

    // Инициализация карт и сброс состояния
    this.cards = this.initializeCards();  // Предположим, что у вас есть метод для инициализации карт
    this.flippedCards = [];

    // Запуск таймера
    this.timer.start();
  }

  // Окончание игры
  public stopGame(): void {
    // Остановка таймера
    this.timer.stop();

    // Обновление состояния через AppState
    AppState.updateState({ gameStarted: false });
  }

  // Инициализация карт
  private initializeCards(): CardData[] {
    const cards: CardData[] = [];  // Заполнение карт (зависит от ваших данных)
    return cards;
  }

  // Логика переворачивания карты
  public flipCard(card: CardData): void {
    if (card.isMatched || this.flippedCards.length === 2) return; // Если карта уже совпала или уже перевёрнуты 2 карты

    card.isFlipped = true;
    this.flippedCards.push(card);

    // Проверка на совпадение карт
    if (this.flippedCards.length === 2) {
      this.checkForMatch();
    }
  }

  // Проверка на совпадение карт
  private checkForMatch(): void {
    const [firstCard, secondCard] = this.flippedCards;

    if (firstCard.id === secondCard.id) {
      firstCard.isMatched = true;
      secondCard.isMatched = true;
    } else {
      setTimeout(() => {
        firstCard.isFlipped = false;
        secondCard.isFlipped = false;
      }, 1000);
    }

    this.flippedCards = [];
  }

  // Обновление времени игры
  private updateGameTime = (seconds: number): void => {
    AppState.updateState({ gameTime: seconds });
  }
}

export const gameManager = GameManager.getInstance();
