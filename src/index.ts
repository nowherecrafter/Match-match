import { header } from './components/header';
import { Router } from './components/router';
import { AppState } from './services/state';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';  
import '@popperjs/core';
import './styles/game.css';
import './styles/base.css';
import './styles/header.css';
import './styles/modal.css';


document.addEventListener('DOMContentLoaded', () => {
  // Mount header
  header.mount();

  // Initialize router
  const router = new Router();
  
  // Set initial route
  const initialPath = window.location.pathname;
  router.navigate(initialPath === '/' ? '/about' : initialPath);

  // Обновим UI после инициализации
  header.updateUI(AppState.getState());
});

