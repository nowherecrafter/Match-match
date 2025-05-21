export interface CardData {
  id: number;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface CardProps {
  card: CardData;
}

/**
 * Creates a card HTMLElement with front and back sides.
 * Uses only one DOM creation per call, no repeated queries.
 */
export function createCard({ card }: CardProps): HTMLElement {
  const cardBackImage = card.image;

  // Main card container
  const cardElement = document.createElement('div');
  cardElement.classList.add('game-card', 'd-flex', 'justify-content-center', 'align-items-center');
  cardElement.dataset.id = String(card.id);

  // Inner wrapper for flip effect
  const cardInner = document.createElement('div');
  cardInner.classList.add('card-inner');

  // Front side showing generic back image
  const cardFront = document.createElement('div');
  cardFront.classList.add('card-front');
  const frontImg = document.createElement('img');
  frontImg.src = 'assets/images/back.png';
  frontImg.alt = 'Card front';
  frontImg.classList.add('img-fluid');
  cardFront.appendChild(frontImg);

  // Back side showing the card-specific image
  const cardBack = document.createElement('div');
  cardBack.classList.add('card-back');
  const backImg = document.createElement('img');
  backImg.src = cardBackImage;
  backImg.alt = 'Card back';
  backImg.classList.add('img-fluid');
  cardBack.appendChild(backImg);

  // Compose card structure
  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  cardElement.appendChild(cardInner);

  return cardElement;
}

export function flipCard(target: HTMLElement): void {
  const cardElement = target.closest('.game-card');
  if (cardElement) {
    cardElement.classList.add('flipped');
  }
}

export function unflipCard(target: HTMLElement): void {
  const cardElement = target.closest('.game-card');
  if (cardElement) {
    cardElement.classList.remove('flipped');
  }
}

export function markAsMatched(target: HTMLElement) {
  const cardInner = target.closest('.card-inner');
  if (cardInner) {
    cardInner.classList.add('matched');
  }
}

export function markAsUnmatched(target: HTMLElement) {
  const cardInner = target.closest('.card-inner');
  if (cardInner) {
    cardInner.classList.add('unmatched');
  }
}

export function clearUnmatched(target: HTMLElement) {
  const cardInner = target.closest('.card-inner');
  if (cardInner) {
    cardInner.classList.remove('unmatched');
  }
}
