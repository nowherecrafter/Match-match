import { CardData, createCard } from './card';

export interface GameBoardOptions {
  cards: CardData[];
  difficulty: '4x4' | '6x6' | '8x8';
  onCardClick: (card: CardData) => void;
}

export function renderGameBoard({ cards, difficulty, onCardClick }: GameBoardOptions): void {
  const board = document.getElementById('gameBoard');
  if (!board) return;

  board.innerHTML = '';

  const cardsPerRow = difficulty === '4x4' ? 4 : difficulty === '6x6' ? 6 : 8;
  const numberOfRows = Math.ceil(cards.length / cardsPerRow);

  let cardIndex = 0;

  for (let i = 0; i < numberOfRows; i++) {
    const row = document.createElement('div');
    row.classList.add('row');

    for (let j = 0; j < cardsPerRow && cardIndex < cards.length; j++) {
      const card = cards[cardIndex++];
      const cardElement = createCard({ card, onClick: onCardClick });

      const col = document.createElement('div');
      col.classList.add('col');
      col.appendChild(cardElement);
      row.appendChild(col);
    }

    board.appendChild(row);
  }

  // Устанавливаем ширину gameBoard как 70% от высоты его родителя
  const parent = board.parentElement;
  if (parent) {
    board.style.width = `${window.innerHeight * 0.80}px`;
  }
}
