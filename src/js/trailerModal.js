/* =====================================================
   src/js/trailerModal.js   – versión 100 % responsiva
   ===================================================== */

const body = document.body;
let escListener;

/* ---------- API ---------- */
export function openTrailerModal (videoKey = '') {
  // Obtener referencias actuales cada vez (por si el DOM se regeneró)
  const modal = document.getElementById('trailerModal');
  const container = document.getElementById('trailerContainer');
  
  if (!modal || !container) {
    console.warn('Modal de tráiler no encontrado:', { modal: !!modal, container: !!container });
    return;
  }
  
  console.log('Abriendo tráiler con clave:', videoKey);

  /* 1. Iframe dentro de un “wrapper” 16 : 9          */
  /*    – El wrapper se escala con CSS, el iframe     */
  /*      ocupa 100 % y hereda ese tamaño.            */
  container.innerHTML = `
    <div class="ratio-wrapper">
      <iframe
        src="https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0"
        allow="autoplay; fullscreen"
        loading="lazy"
        allowfullscreen
      ></iframe>
    </div>
  `;

  modal.classList.remove('inactive');
  body.style.overflow = 'hidden';

  /* Cerrar con overlay y ESC */
  modal.addEventListener('click', overlayClose);
  escListener = (e) => { if (e.key === 'Escape') closeTrailerModal(); };
  window.addEventListener('keydown', escListener, { once: true });
}

export function closeTrailerModal () {
  // Obtener referencias actuales cada vez
  const modal = document.getElementById('trailerModal');
  const container = document.getElementById('trailerContainer');
  
  if (!modal) return;
  modal.classList.add('inactive');
  if (container) container.innerHTML = '';        // quita iframe
  body.style.overflow = '';

  modal.removeEventListener('click', overlayClose);
  window.removeEventListener('keydown', escListener);
}

/* ---------- helpers ---------- */
function overlayClose (e) { 
  const modal = document.getElementById('trailerModal');
  if (e.target === modal) closeTrailerModal(); 
}

// Configurar el listener del botón de cerrar de forma dinámica
export function setupTrailerModal() {
  const closeBtn = document.getElementById('closeModalBtn');
  if (closeBtn) {
    // Remover listener anterior si existe
    closeBtn.removeEventListener('click', closeTrailerModal);
    // Agregar nuevo listener
    closeBtn.addEventListener('click', closeTrailerModal);
    console.log('Modal de tráiler configurado correctamente');
  } else {
    console.warn('Botón de cerrar modal no encontrado');
  }
}
