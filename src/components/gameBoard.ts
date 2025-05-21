import { CardData, createCard } from './card';

export interface GameBoardOptions {
  cards: CardData[];
  difficulty: '4x4' | '6x6' | '8x8';
  onCardClick: (card: CardData, event: MouseEvent) => void;
}

/**
 * Renders the game board efficiently using DocumentFragment to minimize reflows.
 * Creates rows and columns according to difficulty.
 * Attaches centralized click handler to each card element.
 */
export function renderGameBoard({ cards, difficulty, onCardClick }: GameBoardOptions): void {
  const board = document.getElementById('gameBoard');
  if (!board) return;

  board.innerHTML = ''; // Clear previous content

  const cardsPerRow = difficulty === '4x4' ? 4 : difficulty === '6x6' ? 6 : 8;
  const numberOfRows = Math.ceil(cards.length / cardsPerRow);

  // Use DocumentFragment to batch DOM insertions
  const fragment = document.createDocumentFragment();
  let cardIndex = 0;

  for (let i = 0; i < numberOfRows; i++) {
    const row = document.createElement('div');
    row.classList.add('row');

    for (let j = 0; j < cardsPerRow && cardIndex < cards.length; j++) {
      const card = cards[cardIndex++];
      const cardElement = createCard({ card });

      // Attach centralized click handler
      cardElement.addEventListener('click', (event) => {
        onCardClick(card, event);
      });

      const col = document.createElement('div');
      // Custom col class for 8x8, default col for others
      col.classList.add(difficulty === '8x8' ? 'col-custom-8' : 'col');

      col.appendChild(cardElement);
      row.appendChild(col);
    }

    fragment.appendChild(row);
  }

  // Append all rows in one operation
  board.appendChild(fragment);

  // Optional: Adjust board width for consistent UI sizing
  const parent = board.parentElement;
  if (parent) {
    board.style.width = `${window.innerHeight * 0.80}px`;
  }
}
