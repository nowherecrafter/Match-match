import { loadAbout } from '../pages/about';
import { loadBestScore } from '../pages/best-score';
import { loadSettings } from '../pages/settings'; // Импорт функции для загрузки страницы настроек

export class Router {
  private routes: { [key: string]: () => void } = {};

  constructor() {
    this.routes = {
      '/about': loadAbout,      // Загружаем About по пути "/about"
      '/': loadAbout,           // Корневой путь перенаправляется на About
      '/best-score': loadBestScore,  // Загружаем Best Score по пути "/best-score"
      '/settings': loadSettings,    // Загружаем страницу настроек по пути "/settings"
    };

    this.setupEventListeners();  // Подключаем обработчики событий
  }

  private setupEventListeners(): void {
    window.addEventListener('popstate', () => this.handleRouteChange());  // Обработка изменения истории
    document.addEventListener('click', (e) => this.handleLinkClick(e));   // Обработка кликов по ссылкам
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
    window.history.pushState({}, path, path);  // Обновляем URL в истории браузера
    this.handleRouteChange();  // Загружаем контент для нового маршрута
  }

  private handleRouteChange(): void {
    const path = window.location.pathname;  // Получаем текущий путь
    const routeHandler = this.routes[path] || this.routes['/about'];  // Если маршрут не найден, загружаем About

    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = '';  // Очищаем контейнер
      routeHandler();  // Загружаем нужную страницу
    }
  }
}
