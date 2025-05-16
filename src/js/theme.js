/* src/js/theme.js – alterna tema y persiste; por defecto DARK */
const LS_KEY = 'cine-theme';
const ROOT   = document.documentElement;
const BTN    = document.querySelector('.theme-toggle');

const ICONS = {
  dark: 'fas fa-sun',
  light: 'fas fa-moon'
};

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa tema: guardado o dark por defecto
  const saved = localStorage.getItem(LS_KEY);
  setTheme(saved || 'dark');

  // Toggle
  BTN?.addEventListener('click', () => {
    setTheme(ROOT.dataset.theme === 'dark' ? 'light' : 'dark');
  });
});

function setTheme(mode) {
  ROOT.dataset.theme = mode;
  localStorage.setItem(LS_KEY, mode);

  const icon = BTN?.querySelector('i');
  if (icon) icon.className = ICONS[mode];

  BTN?.setAttribute(
    'aria-label',
    mode === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
  );
}
