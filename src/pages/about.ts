export function loadAbout(): void {
  const app = document.getElementById('app');
  if (!app) return;

  // Статичные данные для инструкций
  const instructions = [
    {
      step: 1,
      text: 'Register new player in game',
      image: 'register.png'
    },
    {
      step: 2,
      text: 'Configure your game settings',
      image: 'settings.png'
    },
    {
      step: 3,
      text: 'Start your new game! Remember card positions and match them before time runs out.',
      image: 'play.png'
    }
  ];

  // Шаблон контента
  const content = `
    <div class="content-wrapper">
      <div class="main-container">
        <h1 class="text-start">How to Play?</h1>
        <ol class="instructions">
          ${instructions.map(instruction => `
            <li class="instruction-row d-flex align-items-stretch mb-4">
              <div class="instruction-step col-8 d-flex align-items-center">
                <div class="instruction-content">
                  <div class="step-number">${instruction.step}</div>
                  <p>${instruction.text}</p>
                </div>
              </div>
              <div class="col-4 d-flex justify-content-center align-items-center">
                <img class="instruction-image" src="img/${instruction.image}" alt="Step ${instruction.step}" />
              </div>
            </li>
          `).join('')}
        </ol>
      </div>
    </div>
  `;

  // Вставляем в DOM
  app.innerHTML = content;
}
