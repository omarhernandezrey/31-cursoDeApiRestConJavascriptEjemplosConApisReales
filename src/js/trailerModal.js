/* =====================================================
   src/js/trailerModal.js   – versión 100 % responsiva
   ===================================================== */

const body      = document.body;
const modal     = document.getElementById('trailerModal');
const container = document.getElementById('trailerContainer');
const closeBtn  = document.getElementById('closeModalBtn');
let escListener;

/* ---------- API ---------- */
export function openTrailerModal (videoKey = '') {
  if (!modal || !container) return;

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
  if (!modal) return;
  modal.classList.add('inactive');
  container.innerHTML = '';        // quita iframe
  body.style.overflow = '';

  modal.removeEventListener('click', overlayClose);
  window.removeEventListener('keydown', escListener);
}

/* ---------- helpers ---------- */
function overlayClose (e) { if (e.target === modal) closeTrailerModal(); }
closeBtn?.addEventListener('click', closeTrailerModal);
