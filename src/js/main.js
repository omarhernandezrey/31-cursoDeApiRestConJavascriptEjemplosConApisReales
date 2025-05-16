// src/js/main.js
import { setupNavigation } from './navigation.js';
import { elements } from './dom.js';

// 1) Registrar rutas ANTES de DOMContentLoaded
setupNavigation();

// 2) Al cargar el DOM: tema y búsqueda
document.addEventListener('DOMContentLoaded', () => {
  const theme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);

  elements.searchForm?.addEventListener('submit', e => {
    e.preventDefault();
    const q = elements.searchInput.value.trim();
    if (q) location.hash = `#search=${encodeURIComponent(q)}`;
    elements.searchInput.value = '';
  });
});
