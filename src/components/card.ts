export interface CardData {
  id: number;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface CardProps {
  card: CardData;
}

// src/components/card.ts

export interface CardData {
  id: number;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface CardProps {
  card: CardData;
}

export function createCard({ card }: CardProps): HTMLElement {
  const cardBackImage = card.image;
  const cardElement = document.createElement('div');
  cardElement.classList.add('game-card', 'd-flex', 'justify-content-center', 'align-items-center');
  cardElement.dataset.id = String(card.id);

  const cardInner = document.createElement('div');
  cardInner.classList.add('card-inner');

  const cardFront = document.createElement('div');
  cardFront.classList.add('card-front');
  const frontImg = document.createElement('img');
  frontImg.src = 'assets/images/back.png';
  frontImg.alt = 'Card front';
  frontImg.classList.add('img-fluid');
  cardFront.appendChild(frontImg);

  const cardBack = document.createElement('div');
  cardBack.classList.add('card-back');
  const backImg = document.createElement('img');
  backImg.src = cardBackImage;
  backImg.alt = 'Card back';
  backImg.classList.add('img-fluid');
  cardBack.appendChild(backImg);

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
