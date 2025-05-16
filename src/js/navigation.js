/* ======================================================================
   src/js/navigation.js      (archivo COMPLETO: reemplaza el actual)
   Enrutador SPA + listas + back-button + modal tráiler
   ====================================================================== */

import {
  getTrendingMovies,
  getCategories,
  getMoviesByCategory,
  searchMovies,
  getMovieDetails,
  getFullImageUrl
} from './api.js';

import {
  elements,
  createMovieCard,
  createCategoryCard,
  createCastCard,
  renderList
} from './dom.js';

import {
  openTrailerModal,
  closeTrailerModal
} from './trailerModal.js';

/* -------------------------------------------------- */
/* 1. Navegación inicial                              */
/* -------------------------------------------------- */
export function setupNavigation () {
  window.addEventListener('DOMContentLoaded', handleRoute, { passive: true });
  window.addEventListener('hashchange',       handleRoute, { passive: true });
  window.addEventListener('scroll',           handleInfiniteScroll, { passive: true });

  /* Botones fijos */
  elements.headerBackBtn?.addEventListener('click', () => (location.hash = '#home'));
  elements.viewAllBtn   ?.addEventListener('click', () => (location.hash = '#trends'));
  elements.heroBtn      ?.addEventListener('click', () => (location.hash = '#trends'));
  elements.closeModalBtn?.addEventListener('click', closeTrailerModal);

  /* Delegación de clic para tarjetas */
  document.body.addEventListener('click', delegateCards, { passive: true });
}

/* -------------------------------------------------- */
/* 2. Enrutador SPA                                   */
/* -------------------------------------------------- */
async function handleRoute () {
  resetView();

  const h = location.hash;
  if (h.startsWith('#movie=')) {
    await loadMovieDetail(h.slice(7));
  } else if (h.startsWith('#category=')) {
    const [id, name] = h.slice(10).split('-');
    await loadCategoryPage(id, decodeURIComponent(name));
  } else if (h.startsWith('#search=')) {
    await loadSearchPage(decodeURIComponent(h.slice(8)));
  } else if (h === '#trends') {
    await loadTrendingPage();
  } else {
    await loadHomePage(); /* '' | '#home' */
  }
}

/* -------------------------------------------------- */
/* 3. Páginas                                         */
/* -------------------------------------------------- */
async function loadHomePage () {
  elements.headerTitle.classList.remove('inactive');
  elements.headerCategoryTitle.classList.add('inactive');
  elements.heroSection.classList.remove('inactive');
  elements.trendingSection.classList.remove('inactive');
  elements.categoriesSection.classList.remove('inactive');

  renderList(await getTrendingMovies(), createMovieCard,    elements.trendingMoviesList);
  renderList(await getCategories(),    createCategoryCard,  elements.categoriesList);
}

async function loadCategoryPage (id, name) {
  elements.headerTitle.classList.add('inactive');
  elements.headerCategoryTitle.classList.remove('inactive');
  elements.headerCategoryTitle.textContent = name;
  showGeneric();

  const { results } = await getMoviesByCategory(id);
  renderList(results, createMovieCard, elements.moviesGrid);
}

async function loadSearchPage (query) {
  elements.headerTitle.classList.add('inactive');
  elements.headerCategoryTitle.classList.remove('inactive');
  elements.headerCategoryTitle.textContent = `Resultados: ${query}`;
  showGeneric();

  const { results } = await searchMovies(query);
  renderList(results, createMovieCard, elements.moviesGrid);
}

async function loadTrendingPage () {
  elements.headerTitle.classList.add('inactive');
  elements.headerCategoryTitle.classList.remove('inactive');
  elements.headerCategoryTitle.textContent = 'Tendencias';
  showGeneric();

  renderList(await getTrendingMovies('week'), createMovieCard, elements.moviesGrid);
}

async function loadMovieDetail (id) {
  showDetail();

  const m = await getMovieDetails(id);

  /* Hero y datos base */
  elements.movieDetailHero.style.backgroundImage =
    `url(${getFullImageUrl(m.backdrop_path, 'original')})`;
  elements.moviePoster.src     = getFullImageUrl(m.poster_path, 'w500');
  elements.moviePoster.onerror = () => { elements.moviePoster.src = './src/img/no-image.jpg'; };
  elements.movieDetailTitle.textContent = m.title;
  elements.movieRating .innerHTML = `<i class="fas fa-star"></i> ${m.vote_average?.toFixed(1) || 'N/A'} (${m.vote_count} votos)`;
  elements.movieRuntime.innerHTML = `<i class="fas fa-clock"></i> ${m.runtime || 'N/A'} min`;
  elements.movieYear   .innerHTML = `<i class="fas fa-calendar-alt"></i> ${m.release_date?.split('-')[0] || 'N/A'}`;

  /* Géneros, sinopsis, reparto, similares */
  elements.movieTags.innerHTML        = m.genres.map(g => `<span class="tag">${g.name}</span>`).join('');
  elements.movieDescription.textContent = m.overview || 'No hay descripción disponible.';
  renderList(m.cast,     createCastCard, elements.castGrid);
  renderList(m.similar,  createMovieCard, elements.similarMoviesList);

  /* Tráiler */
  const tKey = m.videos.find(v => v.type === 'Trailer')?.key;
  if (tKey) {
    elements.watchTrailerBtn.style.display = 'inline-flex';
    elements.watchTrailerBtn.onclick = () => openTrailerModal(tKey);
  } else {
    elements.watchTrailerBtn.style.display = 'none';
  }
}

/* -------------------------------------------------- */
/* 4. Delegación de clic                              */
/* -------------------------------------------------- */
function delegateCards (e) {
  const movieCard = e.target.closest('.movie-card');
  if (movieCard) {
    location.hash = `#movie=${movieCard.dataset.id}`;
    return;
  }
  const catCard = e.target.closest('.category-card');
  if (catCard) {
    const name = catCard.querySelector('.category-name').textContent;
    location.hash = `#category=${catCard.dataset.id}-${encodeURIComponent(name)}`;
  }
}

/* -------------------------------------------------- */
/* 5. Scroll infinito (placeholder)                   */
/* -------------------------------------------------- */
function handleInfiniteScroll () {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 300 &&
      !elements.movieDetailSection.classList.contains('inactive')) {
    /* … cargar más si lo deseas */
  }
}

/* -------------------------------------------------- */
/* 6. Helpers de vista                                */
/* -------------------------------------------------- */
function resetView () {
  [
    elements.heroSection,
    elements.trendingSection,
    elements.categoriesSection,
    elements.genericListSection,
    elements.movieDetailSection
  ].forEach(el => el.classList.add('inactive'));

  elements.headerBackBtn.classList.add('inactive');
  elements.headerTitle.classList.remove('inactive');
  elements.headerCategoryTitle.classList.add('inactive');
}

function showGeneric () {
  elements.genericListSection.classList.remove('inactive');
  elements.headerBackBtn.classList.remove('inactive');
}

function showDetail () {
  elements.movieDetailSection.classList.remove('inactive');
  elements.headerBackBtn.classList.remove('inactive');
}
