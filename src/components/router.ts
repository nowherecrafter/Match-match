import { loadAbout } from '../pages/about';
import { loadBestScore } from '../pages/best-score';
import { loadSettings } from '../pages/settings';
import { loadGame, unloadGame } from '../pages/game';
import { load404 } from '../pages/page404'; 
  
export class Router {
  // Route definitions with load and optional unload handlers
  private routes: {
    [key: string]: {
      load: () => void | Promise<void>;
      unload?: () => void | Promise<void>;
    };
  } = {};

  // Currently active route path
  private currentRoute?: string;

  constructor() {
    // Define available routes and their handlers
    this.routes = {
      '/about': { load: loadAbout },
      '/': { load: loadAbout },
      '/best-score': { load: loadBestScore },
      '/settings': { load: loadSettings },
      '/game': { load: loadGame, unload: unloadGame },
      '/404': { load: load404 },   
    };

    this.setupEventListeners();
  }

  /**
   * Sets up global event listeners:
   * - 'popstate' for browser back/forward navigation
   * - 'click' for internal navigation links
   */
  private setupEventListeners(): void {
    window.addEventListener('popstate', () => this.handleRouteChange());
    document.addEventListener('click', (e) => this.handleLinkClick(e));
  }

  /**
   * Handles clicks on navigation links (<a>) to enable client-side routing.
   */
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

  /**
   * Navigates to a new route by updating browser history and triggering route change.
   * Prevents redundant navigation to the current route.
   */
  public async navigate(path: string): Promise<void> {
    if (path === this.currentRoute) return;

    window.history.pushState({}, path, path);
    await this.handleRouteChange();
  }

  /**
   * Handles the route transition:
   * - Runs the unload function of the previous route (if any)
   * - Clears the app container
   * - Executes the load function of the new route
   * - Falls back to /404 if route is unknown
   */
  private async handleRouteChange(): Promise<void> {
    const path = window.location.pathname;
    const newRoute = this.routes[path] || this.routes['/404'];

    // Call unload handler for previous route, if defined
    if (this.currentRoute && this.routes[this.currentRoute]?.unload) {
      await this.routes[this.currentRoute]!.unload!();
    }

    this.currentRoute = path;

    // Clear the main app container before loading new content
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = '';
    }

    // Load the new route
    await newRoute.load();
  }
}
