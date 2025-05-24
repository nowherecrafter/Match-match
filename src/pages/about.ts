interface Instruction {
  step: number;
  text: string;
  image: string;
}

// Static data for instructions (defined outside to avoid recreation)
const instructions: Instruction[] = [
  {
    step: 1,
    text: 'Register new player in game',
    image: 'register.jpg',
  },
  {
    step: 2,
    text: 'Configure your game settings',
    image: 'settings.jpg',
  },
  {
    step: 3,
    text: 'Start your new game! Remember card positions and match them before time runs out.',
    image: 'play.jpg',
  },
];

/**
 * Loads the "About" page content into the #app container.
 * Uses programmatic DOM creation for improved maintainability and clarity.
 * Keeps the structure modular and safe, with minimal side effects.
 */
export function loadAbout(): void {
  const app = document.getElementById('app');
  if (!app) return;

  // Clear existing content
  app.innerHTML = '';

  // Create the main wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'content-wrapper';

  const mainContainer = document.createElement('div');
  mainContainer.className = 'main-container';

  // Create and append the page heading
  const title = document.createElement('h1');
  title.className = 'text-start';
  title.textContent = 'How to Play?';
  mainContainer.appendChild(title);

  // Create the list of instructions
  const ol = document.createElement('ol');
  ol.className = 'instructions';

  instructions.forEach(({ step, text, image }) => {
    const li = document.createElement('li');
    li.className = 'instruction-row d-flex align-items-stretch mb-4';

    // Left section with step number and text
    const stepSection = document.createElement('div');
    stepSection.className = 'instruction-step col-8 d-flex align-items-center';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'instruction-content';

    const stepNumber = document.createElement('div');
    stepNumber.className = 'step-number';
    stepNumber.textContent = step.toString();

    const description = document.createElement('p');
    description.textContent = text;

    contentDiv.appendChild(stepNumber);
    contentDiv.appendChild(description);
    stepSection.appendChild(contentDiv);

    // Right section with image
    const imageSection = document.createElement('div');
    imageSection.className = 'col-4 d-flex justify-content-center align-items-center';

    const img = document.createElement('img');
    img.className = 'instruction-image';
    img.src = `assets/images/About/${image}`;
    img.alt = `Step ${step}`;

    imageSection.appendChild(img);

    // Compose and add this list item
    li.appendChild(stepSection);
    li.appendChild(imageSection);
    ol.appendChild(li);
  });

  // Final DOM assembly
  mainContainer.appendChild(ol);
  contentWrapper.appendChild(mainContainer);
  app.appendChild(contentWrapper);
}
