// src/components/card.ts
export interface CardData {
  id: number;        // Уникальный ID карточки
  image: string;     // Путь к изображению
  isFlipped: boolean; // Перевёрнута ли карточка?
  isMatched: boolean; // Найдена ли пара?
}

interface CardProps {
  card: CardData;
  onClick: (card: CardData) => void;
}

// Функция для создания карточки
export function createCard({ card, onClick }: CardProps): HTMLElement {
  const cardBackImage = 'assets/images/back.png'; // Путь для рубашки карты
  const cardElement = document.createElement('div');
  cardElement.classList.add('card', 'd-flex', 'justify-content-center', 'align-items-center');
  cardElement.dataset.id = String(card.id);

  if (card.isMatched) {
    cardElement.classList.add('matched'); // Визуализация совпавших карт
  } else if (card.isFlipped) {
    cardElement.classList.add('flipped'); // Визуализация перевёрнутой карты
  }

  // Добавляем обработчик клика
  cardElement.addEventListener('click', () => {
    onClick(card);
  });

  // Контент карточки
  cardElement.innerHTML = `
  <div class="card-inner">
    <div class="card-front">
      <img src="${cardBackImage}" alt="Card back" />
    </div>
    <div class="card-back">
      <img src="${card.image}" alt="Card image" />
    </div>
  </div>
`;

  return cardElement;
}
