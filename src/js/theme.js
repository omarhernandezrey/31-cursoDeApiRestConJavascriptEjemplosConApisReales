/* =========================================================
   theme.js – cambio claro/oscuro + persistencia localStorage
   ========================================================= */
const root       = document.documentElement;             // <html>
const btnToggle  = document.querySelector('.theme-toggle');
const ICON_MOON  = 'fas fa-moon';
const ICON_SUN   = 'fas fa-sun';
const LS_KEY     = 'cine-theme';                         // clave localStorage

/* — carga preferencia guardada o sistema — */
const initial = localStorage.getItem(LS_KEY) ||
               (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
setTheme(initial);

/* — clic en el botón — */
btnToggle?.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(next);
});

/* — helper — */
function setTheme (mode = 'dark') {
  root.setAttribute('data-theme', mode);
  localStorage.setItem(LS_KEY, mode);

  btnToggle.querySelector('i').className = mode === 'dark' ? ICON_SUN : ICON_MOON;
  btnToggle.setAttribute('aria-label', mode === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
}
