// src/js/dom.js
import { getFullImageUrl } from './api.js';

export const elements = {
  headerBackBtn: document.querySelector('.header__back-btn'),
  viewAllBtn: document.querySelector('.view-all-btn'),
  heroBtn: document.querySelector('.hero__btn'),
  closeModalBtn: document.querySelector('.close-modal-btn'),
  searchForm: document.getElementById('searchForm'),
  searchInput: document.querySelector('.search-input'),

  headerTitle: document.querySelector('.header__title'),
  headerCategoryTitle: document.querySelector('.header__title--category'),
  pageTitle: document.getElementById('pageTitle'),
  pageTitleText: document.getElementById('pageTitleText'),
  heroSection: document.getElementById('hero'),

  trendingSection: document.getElementById('trendingPreview'),
  trendingMoviesList: document.getElementById('trendingMoviesList'),

  categoriesSection: document.getElementById('categoriesPreview'),
  categoriesList: document.getElementById('categoriesList'),

  sagasSection: document.getElementById('sagasPreview'),
  sagasList: document.getElementById('sagasList'),
  viewAllSagasBtn: document.getElementById('viewAllSagasBtn'),

  genericListSection: document.getElementById('genericList'),
  moviesGrid: document.getElementById('moviesGrid'),
  paginationContainer: document.getElementById('paginationContainer'),

  movieDetailSection: document.getElementById('movieDetail'),
  movieDetailHero: document.querySelector('.movie-detail__hero'),
  moviePoster: document.getElementById('moviePoster'),
  movieDetailTitle: document.getElementById('movieDetailTitle'),
  movieRating: document.getElementById('movieRating'),
  movieRuntime: document.getElementById('movieRuntime'),
  movieYear: document.getElementById('movieYear'),
  movieTags: document.getElementById('movieTags'),
  movieDescription: document.getElementById('movieDescription'),
  castGrid: document.getElementById('movieCast'),
  watchTrailerBtn: document.getElementById('watchTrailerBtn'),

  similarMoviesList: document.getElementById('similarMoviesList'),

  trailerModal: document.getElementById('trailerModal'),
  trailerContainer: document.getElementById('trailerContainer'),
};

export const createMovieCard = ({ id, title, poster_path, vote_average, release_date, original_title, overview, genre_ids, popularity, adult, original_language, vote_count, backdrop_path }) => {
  const year = release_date?.split('-')[0] || 'N/A';
  
  // Crear atributos data para el sistema de favoritos
  const dataAttributes = [
    `data-movie-id="${id}"`,
    `data-movie-title="${escapeHtml(title)}"`,
    `data-movie-original-title="${escapeHtml(original_title || title)}"`,
    `data-movie-poster="${poster_path || ''}"`,
    `data-movie-backdrop="${backdrop_path || ''}"`,
    `data-movie-overview="${escapeHtml(overview || '')}"`,
    `data-movie-release-date="${release_date || ''}"`,
    `data-movie-rating="${vote_average || 0}"`,
    `data-movie-vote-count="${vote_count || 0}"`,
    `data-movie-genres="${genre_ids ? genre_ids.join(',') : ''}"`,
    `data-movie-popularity="${popularity || 0}"`,
    `data-movie-adult="${adult || false}"`,
    `data-movie-language="${original_language || ''}"`
  ].join(' ');
  
  // Verificar si está en favoritos de forma segura
  let isFavorited = false;
  let favoriteClass = 'favorite-btn';
  let favoriteIcon = 'far fa-heart';
  let favoriteTitle = 'Agregar a favoritos';
  
  try {
    if (window.favoritesAPI && window.favoritesAPI.isFavorite) {
      isFavorited = window.favoritesAPI.isFavorite(id);
      if (isFavorited) {
        favoriteClass = 'favorite-btn favorite-btn--active';
        favoriteIcon = 'fas fa-heart';
        favoriteTitle = 'Quitar de favoritos';
      }
    }
  } catch (error) {
    // Error silencioso, continuar sin favoritos
  }
  
  return `
    <div class="movie-card" data-id="${id}" ${dataAttributes}>
      <button class="${favoriteClass}" aria-label="${favoriteTitle}" title="${favoriteTitle}" aria-pressed="${isFavorited}">
        <i class="${favoriteIcon}"></i>
      </button>
      <img src="${getFullImageUrl(poster_path)}" alt="${title}" class="movie-card__img" loading="lazy" onerror="this.src='./src/img/no-image.jpg'">
      <div class="movie-card__overlay">
        <div class="movie-card__info">
          <h3 class="movie-card__title">${title}</h3>
          <div class="movie-card__meta">
            <span class="movie-card__rating"><i class="fas fa-star"></i> ${vote_average?.toFixed(1) || 'N/A'}</span>
            <span class="movie-card__year">${year}</span>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Función auxiliar para escapar HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

export const createCategoryCard = ({ id, name }) => `
  <div class="category-card" data-id="${id}">
    <h3 class="category-name">${name}</h3>
    <div class="category-overlay"></div>
  </div>
`;

export const createSagaCard = ({ id, name, poster_path, movieCount }) => {
  // Determinar si es una saga Marvel o DC y el personaje específico
  const isMarvel = isMarvelSaga(name);
  const isDC = isDCSaga(name);
  const character = getCharacterSlug(name);
  
  let dataAttributes = `data-saga-id="${id}"`;
  
  if (isMarvel) {
    dataAttributes += ` data-franchise="marvel" data-character="${character}"`;
  } else if (isDC) {
    dataAttributes += ` data-franchise="dc" data-character="${character}"`;
  }
  
  return `
    <div class="saga-card" ${dataAttributes}>
      <div class="saga-card__image">
        <img src="${getFullImageUrl(poster_path, 'w300')}" alt="${name}" loading="lazy" onerror="this.src='./src/img/no-image.jpg'">
        <div class="saga-card__overlay">
          <div class="saga-card__info">
            <h3 class="saga-card__title">${name}</h3>
            <p class="saga-card__count">${movieCount} películas</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Función auxiliar para determinar si es una saga Marvel o DC
const isMarvelSaga = (name) => {
  const marvelSagas = ['Universo Marvel', 'Avengers', 'X-Men'];
  return marvelSagas.includes(name);
};

const isDCSaga = (name) => {
  const dcSagas = ['Universo DC'];
  return dcSagas.includes(name);
};

// Función auxiliar para obtener el slug del personaje
const getCharacterSlug = (name) => {
  const characterSlugs = {
    'Universo Marvel': 'marvel-universe',
    'Avengers': 'avengers',
    'X-Men': 'x-men',
    'Universo DC': 'dc-universe'
  };
  return characterSlugs[name] || 'generic';
};

export const createCastCard = ({ profile_path, name, character }) => `
  <div class="cast-card">
    <img src="${getFullImageUrl(profile_path, 'w185')}" alt="${name}" class="cast-card__img" loading="lazy" onerror="this.src='./src/img/no-avatar.png'">
    <h4 class="cast-card__name">${name}</h4>
    <p class="cast-card__character">${character || 'N/A'}</p>
  </div>
`;

export const createCrewCard = ({ profile_path, name, job }) => `
  <div class="crew-card">
    <img src="${getFullImageUrl(profile_path, 'w185')}" alt="${name}" class="crew-card__img" loading="lazy" onerror="this.src='./src/img/no-avatar.png'">
    <h4 class="crew-card__name">${name}</h4>
    <p class="crew-card__job">${job || 'N/A'}</p>
  </div>
`;

export const createReviewCard = ({ author, content, created_at, author_details }) => {
  const rating = author_details?.rating ? `⭐ ${author_details.rating}/10` : '';
  const truncatedContent = content.length > 300 ? content.substring(0, 300) + '...' : content;
  const reviewDate = created_at ? new Date(created_at).toLocaleDateString('es-ES') : '';
  
  return `
    <div class="review-card">
      <div class="review-card__header">
        <h4 class="review-card__author">${author}</h4>
        <div class="review-card__meta">
          ${rating ? `<span class="review-card__rating">${rating}</span>` : ''}
          ${reviewDate ? `<span class="review-card__date">${reviewDate}</span>` : ''}
        </div>
      </div>
      <p class="review-card__content">${truncatedContent}</p>
    </div>
  `;
};

export const createKeywordTag = (keyword) => `
  <span class="keyword-tag">${keyword.name}</span>
`;

export const createImageGalleryItem = ({ file_path, aspect_ratio }, type = 'backdrop') => `
  <div class="gallery-item" data-src="${getFullImageUrl(file_path, 'w780')}">
    <img src="${getFullImageUrl(file_path, 'w300')}" alt="Imagen de la película" class="gallery-item__img" loading="lazy">
    <div class="gallery-item__overlay">
      <i class="fas fa-expand"></i>
    </div>
  </div>
`;

export const formatCurrency = (amount) => {
  if (!amount || amount === 0) return 'No disponible';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (number) => {
  if (!number || number === 0) return 'No disponible';
  return new Intl.NumberFormat('es-ES').format(number);
};

export const renderList = (items, createCardFn, container) => {
  container.innerHTML = items.length
    ? items.map(item => createCardFn(item)).join('')
    : '<p class="no-results">No se encontraron resultados</p>';
};

/* ─────────────────────────────────────────────────────────────────────
   COMPONENTES SKELETON LOADING
   ───────────────────────────────────────────────────────────────────── */

export const createMovieCardSkeleton = () => `
  <div class="movie-card-skeleton">
    <div class="movie-card-skeleton__image skeleton"></div>
    <div class="movie-card-skeleton__content">
      <div class="movie-card-skeleton__title skeleton"></div>
      <div class="movie-card-skeleton__meta">
        <div class="movie-card-skeleton__rating skeleton"></div>
        <div class="movie-card-skeleton__year skeleton"></div>
      </div>
    </div>
  </div>
`;

export const createCategoryCardSkeleton = () => `
  <div class="category-card-skeleton">
    <div class="category-card-skeleton__title skeleton"></div>
  </div>
`;

export const createSagaCardSkeleton = () => `
  <div class="saga-card-skeleton">
    <div class="saga-card-skeleton__image skeleton">
      <div class="saga-card-skeleton__overlay">
        <div class="saga-card-skeleton__title skeleton"></div>
        <div class="saga-card-skeleton__count skeleton"></div>
      </div>
    </div>
  </div>
`;

export const createCastCardSkeleton = () => `
  <div class="cast-card-skeleton">
    <div class="cast-card-skeleton__image skeleton"></div>
    <div class="cast-card-skeleton__name skeleton"></div>
    <div class="cast-card-skeleton__character skeleton"></div>
  </div>
`;

export const createMovieDetailSkeleton = () => `
  <div class="movie-detail-skeleton">
    <div class="movie-detail-skeleton__hero skeleton"></div>
    <div class="container">
      <div class="movie-detail-skeleton__content">
        <div class="movie-detail-skeleton__layout">
          <div class="movie-detail-skeleton__poster skeleton"></div>
          <div class="movie-detail-skeleton__info">
            <div class="movie-detail-skeleton__title skeleton"></div>
            <div class="movie-detail-skeleton__meta">
              <div class="movie-detail-skeleton__meta-item skeleton"></div>
              <div class="movie-detail-skeleton__meta-item skeleton"></div>
              <div class="movie-detail-skeleton__meta-item skeleton"></div>
            </div>
            <div class="movie-detail-skeleton__tags">
              <div class="movie-detail-skeleton__tag skeleton"></div>
              <div class="movie-detail-skeleton__tag skeleton"></div>
              <div class="movie-detail-skeleton__tag skeleton"></div>
            </div>
            <div class="movie-detail-skeleton__synopsis">
              <div class="movie-detail-skeleton__synopsis-title skeleton"></div>
              <div class="movie-detail-skeleton__synopsis-line skeleton"></div>
              <div class="movie-detail-skeleton__synopsis-line skeleton"></div>
              <div class="movie-detail-skeleton__synopsis-line skeleton"></div>
              <div class="movie-detail-skeleton__synopsis-line skeleton"></div>
            </div>
            <div class="movie-detail-skeleton__button skeleton"></div>
          </div>
        </div>
        <div class="movie-detail-skeleton__cast-title skeleton"></div>
        <div class="movie-detail-skeleton__cast-grid">
          ${Array(8).fill(0).map(() => createCastCardSkeleton()).join('')}
        </div>
      </div>
    </div>
  </div>
`;

/* ─────────────────────────────────────────────────────────────────────
   FUNCIONES PARA MOSTRAR/OCULTAR SKELETONS
   ───────────────────────────────────────────────────────────────────── */

export const showMoviesSkeleton = (container, count = 12, isHorizontal = false) => {
  const gridClass = isHorizontal ? 'skeleton-grid--horizontal' : 'skeleton-grid--movies';
  const skeletons = Array(count).fill(0).map(() => createMovieCardSkeleton()).join('');
  
  container.innerHTML = `
    <div class="skeleton-grid ${gridClass}">
      ${skeletons}
    </div>
  `;
};

export const showCategoriesSkeleton = (container, count = 8) => {
  const skeletons = Array(count).fill(0).map(() => createCategoryCardSkeleton()).join('');
  
  container.innerHTML = `
    <div class="skeleton-grid skeleton-grid--categories">
      ${skeletons}
    </div>
  `;
};

export const showSagasSkeleton = (container, count = 6) => {
  const skeletons = Array(count).fill(0).map(() => createSagaCardSkeleton()).join('');
  
  container.innerHTML = `
    <div class="skeleton-grid skeleton-grid--sagas">
      ${skeletons}
    </div>
  `;
};

export const showCastSkeleton = (container, count = 8) => {
  const skeletons = Array(count).fill(0).map(() => createCastCardSkeleton()).join('');
  
  container.innerHTML = `
    <div class="skeleton-grid skeleton-grid--horizontal">
      ${skeletons}
    </div>
  `;
};

export const showMovieDetailSkeleton = (container) => {
  container.innerHTML = createMovieDetailSkeleton();
};

export const hideSkeleton = (container, fadeOut = true) => {
  if (fadeOut) {
    const skeletons = container.querySelectorAll('.skeleton, .skeleton-grid');
    skeletons.forEach(skeleton => {
      skeleton.classList.add('skeleton--fade-out');
    });
    
    setTimeout(() => {
      if (container.querySelector('.skeleton--fade-out')) {
        container.innerHTML = '';
      }
    }, 300);
  } else {
    container.innerHTML = '';
  }
};

/* ─────────────────────────────────────────────────────────────────────
   FUNCIÓN MEJORADA PARA RENDER CON SKELETON
   ───────────────────────────────────────────────────────────────────── */

export const renderListWithLoading = async (
  dataPromise,
  createCardFn,
  container,
  skeletonFn,
  skeletonCount = 12,
  isHorizontal = false
) => {
  // Mostrar skeleton mientras carga
  if (skeletonFn) {
    skeletonFn(container, skeletonCount, isHorizontal);
  }
  
  try {
    const items = await dataPromise;
    
    // Pequeño delay para que se vea el skeleton
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Ocultar skeleton con fade out
    hideSkeleton(container, true);
    
    // Mostrar contenido real después del fade out
    setTimeout(() => {
      renderList(items, createCardFn, container);
    }, 300);
    
    return items;
  } catch (error) {
    hideSkeleton(container, false);
    container.innerHTML = '<p class="error-message">Error cargando contenido</p>';
    throw error;
  }
};

/* ─────────────────────────────────────────────────────────────────────
   COMPONENTES DE PAGINACIÓN
   ───────────────────────────────────────────────────────────────────── */

export const createPaginationComponent = (currentPage, totalPages, onPageChange, options = {}) => {
  const {
    showInfo = true,
    showJump = true,
    showModeToggle = true,
    infiniteScrollEnabled = false,
    totalResults = 0,
    resultsPerPage = 20
  } = options;

  if (totalPages <= 1) return '';

  const maxVisiblePages = 7;
  const delta = Math.floor(maxVisiblePages / 2);

  let startPage = Math.max(1, currentPage - delta);
  let endPage = Math.min(totalPages, currentPage + delta);

  // Ajustar el rango si estamos cerca del inicio o fin
  if (endPage - startPage < maxVisiblePages - 1) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    } else {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
  }

  let paginationHTML = '';

  // Información de resultados
  if (showInfo) {
    const startResult = (currentPage - 1) * resultsPerPage + 1;
    const endResult = Math.min(currentPage * resultsPerPage, totalResults);
    
    paginationHTML += `
      <div class="pagination-info">
        <div class="pagination-info__stats">
          Mostrando ${startResult} - ${endResult} de ${totalResults} resultados (Página ${currentPage} de ${totalPages})
        </div>
        <div class="pagination-info__controls">
          ${showModeToggle ? `
            <label class="pagination-mode-toggle">
              <input type="checkbox" id="infiniteScrollToggle" ${infiniteScrollEnabled ? 'checked' : ''}>
              <span>Scroll infinito</span>
            </label>
          ` : ''}
          ${showJump ? `
            <div class="pagination-jump">
              <span class="pagination-jump__label">Ir a página:</span>
              <input type="number" class="pagination-jump__input" id="pageJumpInput" 
                     min="1" max="${totalPages}" value="${currentPage}">
              <button class="pagination-jump__btn" id="pageJumpBtn">Ir</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Navegación de páginas
  paginationHTML += `
    <div class="pagination-container">
      <nav class="pagination" role="navigation" aria-label="Navegación de páginas">
  `;

  // Botón anterior
  paginationHTML += `
    <button class="pagination__item pagination__item--prev ${currentPage === 1 ? 'pagination__item--disabled' : ''}" 
            data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
      <i class="fas fa-chevron-left"></i> Anterior
    </button>
  `;

  // Primera página y puntos suspensivos
  if (startPage > 1) {
    paginationHTML += `
      <button class="pagination__item" data-page="1">1</button>
    `;
    if (startPage > 2) {
      paginationHTML += `
        <span class="pagination__item pagination__item--ellipsis">...</span>
      `;
    }
  }

  // Páginas numéricas
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="pagination__item ${i === currentPage ? 'pagination__item--active' : ''}" 
              data-page="${i}" ${i === currentPage ? 'aria-current="page"' : ''}>
        ${i}
      </button>
    `;
  }

  // Última página y puntos suspensivos
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `
        <span class="pagination__item pagination__item--ellipsis">...</span>
      `;
    }
    paginationHTML += `
      <button class="pagination__item" data-page="${totalPages}">${totalPages}</button>
    `;
  }

  // Botón siguiente
  paginationHTML += `
    <button class="pagination__item pagination__item--next ${currentPage === totalPages ? 'pagination__item--disabled' : ''}" 
            data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
      Siguiente <i class="fas fa-chevron-right"></i>
    </button>
  `;

  paginationHTML += `
      </nav>
    </div>
  `;

  return paginationHTML;
};

export const renderPagination = (container, currentPage, totalPages, onPageChange, options = {}) => {
  const paginationHTML = createPaginationComponent(currentPage, totalPages, onPageChange, options);
  
  if (!paginationHTML) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = paginationHTML;
  
  // Configurar event listeners
  setupPaginationListeners(container, onPageChange, totalPages);
};

export const setupPaginationListeners = (container, onPageChange, totalPages) => {
  // Event listeners para botones de página
  const pageButtons = container.querySelectorAll('.pagination__item:not(.pagination__item--ellipsis):not(.pagination__item--disabled)');
  pageButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const page = parseInt(button.dataset.page);
      if (page && page !== parseInt(container.querySelector('.pagination__item--active')?.dataset.page)) {
        onPageChange(page);
      }
    });
  });

  // Event listener para salto rápido
  const jumpBtn = container.querySelector('#pageJumpBtn');
  const jumpInput = container.querySelector('#pageJumpInput');
  
  if (jumpBtn && jumpInput) {
    const handleJump = () => {
      const page = parseInt(jumpInput.value);
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
      } else {
        jumpInput.value = container.querySelector('.pagination__item--active')?.dataset.page || 1;
      }
    };

    jumpBtn.addEventListener('click', handleJump);
    jumpInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleJump();
      }
    });
  }

  // Event listener para toggle de scroll infinito
  const infiniteToggle = container.querySelector('#infiniteScrollToggle');
  if (infiniteToggle) {
    infiniteToggle.addEventListener('change', (e) => {
      // Este evento será manejado por navigation.js
      const event = new CustomEvent('infiniteScrollToggle', {
        detail: { enabled: e.target.checked }
      });
      document.dispatchEvent(event);
    });
  }
};

export const updatePaginationState = (container, currentPage, isLoading = false) => {
  if (!container) return;

  // Actualizar estado de carga
  const pagination = container.querySelector('.pagination');
  if (pagination) {
    pagination.classList.toggle('pagination--loading', isLoading);
  }

  // Actualizar página activa
  const activeButton = container.querySelector('.pagination__item--active');
  const newActiveButton = container.querySelector(`[data-page="${currentPage}"]`);
  
  if (activeButton) {
    activeButton.classList.remove('pagination__item--active');
    activeButton.removeAttribute('aria-current');
  }
  
  if (newActiveButton) {
    newActiveButton.classList.add('pagination__item--active');
    newActiveButton.setAttribute('aria-current', 'page');
  }

  // Actualizar input de salto
  const jumpInput = container.querySelector('#pageJumpInput');
  if (jumpInput) {
    jumpInput.value = currentPage;
  }
};

/* ─────────────────────────────────────────────────────────────────────
   FUNCIONES DE UTILIDAD PARA PAGINACIÓN
   ───────────────────────────────────────────────────────────────────── */

export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'instant'
  });
};

export const getPageFromHash = (hash, defaultPage = 1) => {
  const pageMatch = hash.match(/[?&]page=(\d+)/);
  return pageMatch ? parseInt(pageMatch[1]) : defaultPage;
};

export const updateHashWithPage = (hash, page) => {
  if (page <= 1) {
    return hash.replace(/[?&]page=\d+/, '');
  }
  
  const separator = hash.includes('?') ? '&' : '?';
  const baseHash = hash.replace(/[?&]page=\d+/, '');
  return `${baseHash}${separator}page=${page}`;
};
