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
  heroSection: document.getElementById('hero'),

  trendingSection: document.getElementById('trendingPreview'),
  trendingMoviesList: document.getElementById('trendingMoviesList'),

  categoriesSection: document.getElementById('categoriesPreview'),
  categoriesList: document.getElementById('categoriesList'),

  genericListSection: document.getElementById('genericList'),
  moviesGrid: document.getElementById('moviesGrid'),

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

export const createMovieCard = ({ id, title, poster_path, vote_average, release_date }) => {
  const year = release_date?.split('-')[0] || 'N/A';
  return `
    <div class="movie-card" data-id="${id}">
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

export const createCategoryCard = ({ id, name }) => `
  <div class="category-card" data-id="${id}">
    <h3 class="category-name">${name}</h3>
    <div class="category-overlay"></div>
  </div>
`;

export const createCastCard = ({ profile_path, name, character }) => `
  <div class="cast-card">
    <img src="${getFullImageUrl(profile_path, 'w185')}" alt="${name}" class="cast-card__img" loading="lazy" onerror="this.src='./src/img/no-avatar.png'">
    <h4 class="cast-card__name">${name}</h4>
    <p class="cast-card__character">${character || 'N/A'}</p>
  </div>
`;

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
