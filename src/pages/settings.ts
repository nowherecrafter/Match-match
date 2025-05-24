import { GameDatabase } from "../services/db";

// Settings with keys, labels and options
const settings = [
  { key: 'cardType', label: 'Card Type', options: ['Animals', 'Cars', 'Nature'] },
  { key: 'difficulty', label: 'Difficulty', options: ['4x4', '6x6', '8x8'] },
];

/**
 * Creates a select element with options and selected value
 */
function createSelect(settingKey: string, options: string[], selectedValue?: string): HTMLSelectElement {
  const select = document.createElement('select');
  select.id = settingKey;
  select.name = settingKey;
  select.className = 'form-select';

  options.forEach(optionValue => {
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue;
    if (selectedValue === optionValue) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  return select;
}

/**
 * Renders the settings form inside the container element
 */
function renderSettingsForm(container: HTMLElement, storedSettings: Record<string, string> | null): void {
  container.innerHTML = '';

  const title = document.createElement('h1');
  title.className = 'text-start';
  title.textContent = 'Game Settings';
  container.appendChild(title);

  const form = document.createElement('form');
  form.id = 'settingsForm';

  settings.forEach(({ key, label, options }) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'mb-3';

    const labelEl = document.createElement('label');
    labelEl.htmlFor = key;
    labelEl.className = 'form-label';
    labelEl.textContent = label;

    const select = createSelect(key, options, storedSettings?.[key]);

    wrapper.appendChild(labelEl);
    wrapper.appendChild(select);
    form.appendChild(wrapper);
  });

  container.appendChild(form);
}

/**
 * Attaches a change event listener to the settings form,
 * collects form data and saves it to IndexedDB,
 * ensuring the shape matches the expected type.
 */
function attachSettingsChangeHandler(db: GameDatabase): void {
  const form = document.getElementById('settingsForm') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('change', () => {
    const formData = new FormData(form);
    const newSettings: Record<string, string> = {};

    settings.forEach(({ key }) => {
      const value = formData.get(key);
      if (typeof value === 'string') {
        newSettings[key] = value;
      }
    });

    // Verify required keys are present before casting
    if ('cardType' in newSettings && 'difficulty' in newSettings) {
      // Cast to the exact expected type
      db.addGameSettings(newSettings as { cardType: string; difficulty: string });
    } else {
      console.error('Settings object missing required keys:', newSettings);
    }
  });
}

/**
 * Loads the settings page: initializes DB, loads stored settings,
 * renders form and attaches event handlers.
 */
export async function loadSettings(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  const db = new GameDatabase();
  await db.init();

  let storedSettings: Record<string, string> | null = null;
  try {
    storedSettings = await db.getGameSettings();
  } catch (err) {
    console.error('Failed to load stored settings', err);
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'content-wrapper';

  const mainContainer = document.createElement('div');
  mainContainer.className = 'main-container';

  wrapper.appendChild(mainContainer);
  app.innerHTML = '';
  app.appendChild(wrapper);

  renderSettingsForm(mainContainer, storedSettings);
  attachSettingsChangeHandler(db);
}
