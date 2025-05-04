// src/components/card.ts
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
  const cardBackImage = 'assets/images/back.png';  // Рубашка карточки
  const cardElement = document.createElement('div');
  cardElement.classList.add('game-card', 'd-flex', 'justify-content-center', 'align-items-center');
  cardElement.dataset.id = String(card.id);

  if (card.isMatched) {
    cardElement.classList.add('matched');
  } else if (card.isFlipped) {
    cardElement.classList.add('flipped');
  }

  const cardInner = document.createElement('div');
  cardInner.classList.add('game-card-inner');

  // Лицевая сторона карточки
  const cardFront = document.createElement('div');
  cardFront.classList.add('game-card-front');
  const frontImg = document.createElement('img');
  frontImg.src = card.isFlipped ? card.image : cardBackImage;  // Показываем изображение карты или рубашку
  frontImg.alt = 'Card front';
  frontImg.classList.add('img-fluid');  // Добавляем класс img-fluid для ограничения размеров
  cardFront.appendChild(frontImg);

  // Оборотная сторона карточки
  const cardBack = document.createElement('div');
  cardBack.classList.add('game-card-back');
  const backImg = document.createElement('img');
  backImg.src = cardBackImage;
  backImg.alt = 'Card back';
  backImg.classList.add('img-fluid');  // Добавляем класс img-fluid для ограничения размеров
  cardBack.appendChild(backImg);

  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  cardElement.appendChild(cardInner);

  cardElement.addEventListener('click', () => {
    onClick(card);
  });

  // Убираем одну из сторон карты в зависимости от состояния
  if (!card.isFlipped) {
    cardBack.style.display = 'none';  // Прячем оборотную сторону, если карта не перевёрнута
  } else {
    cardFront.style.display = 'none';  // Прячем лицевую сторону, если карта перевёрнута
  }

  return cardElement;
}
