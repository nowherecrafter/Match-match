export interface CardData {
  id: number;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface CardProps {
  card: CardData;
  onClick: (card: CardData) => void;
}

export function createCard({ card, onClick }: CardProps): HTMLElement {
  const cardBackImage = card.image;
  const cardElement = document.createElement('div');
  cardElement.classList.add('game-card', 'd-flex', 'justify-content-center', 'align-items-center');
  cardElement.dataset.id = String(card.id);

  if (card.isMatched) {
    cardElement.classList.add('matched');
  }

  // Убираем класс flipped, если карта не перевёрнута
  if (card.isFlipped) {
    cardElement.classList.add('flipped');
  }

  const cardInner = document.createElement('div');
  cardInner.classList.add('card-inner');

  // Лицевая сторона
  const cardFront = document.createElement('div');
  cardFront.classList.add('card-front');
  const frontImg = document.createElement('img');
  frontImg.src = 'assets/images/back.png';
  frontImg.alt = 'Card front';
  frontImg.classList.add('img-fluid');
  cardFront.appendChild(frontImg);

  // Оборотная сторона (рубашка)
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

  cardElement.addEventListener('click', () => {
    if (!card.isFlipped) {
      card.isFlipped = true;
      cardElement.classList.add('flipped');
      onClick(card);
    }
  });

  return cardElement;
}

