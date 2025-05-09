import { loadAbout } from '../pages/about';
import { loadBestScore } from '../pages/best-score';
import { loadSettings } from '../pages/settings';
import { loadGame, unloadGame } from '../pages/game';

export class Router {
  private routes: {
    [key: string]: {
      load: () => void;
      unload?: () => void;
    };
  } = {};

  private currentRoute?: string;

  constructor() {
    this.routes = {
      '/about': { load: loadAbout },
      '/': { load: loadAbout },
      '/best-score': { load: loadBestScore },
      '/settings': { load: loadSettings },
      '/game': { load: loadGame, unload: unloadGame },
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('popstate', () => this.handleRouteChange());
    document.addEventListener('click', (e) => this.handleLinkClick(e));
  }

  private handleLinkClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' && target.classList.contains('nav-link')) {
      e.preventDefault();
      const rawHref = target.getAttribute('href');
      if (rawHref) {
        const path = new URL(rawHref, window.location.origin).pathname;
        this.navigate(path);
      }
    }
  }

  public navigate(path: string): void {
    window.history.pushState({}, path, path);
    this.handleRouteChange();
  }

  private handleRouteChange(): void {
    const path = window.location.pathname;
    const newRoute = this.routes[path] || this.routes['/'];

    if (this.currentRoute && this.routes[this.currentRoute]?.unload) {
      this.routes[this.currentRoute]!.unload!();
    }

    this.currentRoute = path;

    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = '';
      newRoute.load();
    }
  }
}
