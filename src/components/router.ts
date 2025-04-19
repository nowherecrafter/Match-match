import { loadAbout } from '../pages/about';

export class Router {
  private routes: { [key: string]: () => void } = {};

  constructor() {
    this.routes = {
      '/about': loadAbout,
      '/': loadAbout,
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
      const path = new URL(target.getAttribute('href')!).pathname;
      this.navigate(path);
    }
  }

  public navigate(path: string): void {
    window.history.pushState({}, path, path);
    this.handleRouteChange();
  }

  private handleRouteChange(): void {
    const path = window.location.pathname;
    const routeHandler = this.routes[path] || this.routes['/about'];

    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = '';  // Очищаем предыдущий контент
      routeHandler();
    }
  }
}
