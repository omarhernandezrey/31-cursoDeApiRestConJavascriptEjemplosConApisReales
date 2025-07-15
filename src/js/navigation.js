/* =====================================================================
   src/js/navigation.js   —  VERSIÓN COMPLETA Y FUNCIONAL
   SPA + Detalle + Scroll infinito con IntersectionObserver
   • Sin duplicados  • Sentinel recolocado tras cada lote
   ===================================================================== */

import {
  getTrendingMovies,
  getCategories,
  getMoviesByCategory,
  searchMovies,
  getMovieDetails,
  getFullImageUrl,
} from './api.js';

import {
  elements,
  createMovieCard,
  createCategoryCard,
  createCastCard,
  renderList,
  renderListWithLoading,
  showMoviesSkeleton,
  showCategoriesSkeleton,
  showCastSkeleton,
  showMovieDetailSkeleton,
  hideSkeleton,
} from './dom.js';

import { openTrailerModal, closeTrailerModal } from './trailerModal.js';

/* ─── ESTADO GLOBAL ─────────────────────────────────────────── */
let page = 1;
let maxPage = 1;
const shownIds = new Set();
let observer;                       // IntersectionObserver

/* ═════════ 1. LISTENERS ═════════ */
export function setupNavigation () {
  window.addEventListener('DOMContentLoaded', handleRoute, { passive:true });
  window.addEventListener('hashchange',       handleRoute, { passive:true });

  elements.headerBackBtn?.addEventListener('click', () => history.back());
  elements.viewAllBtn   ?.addEventListener('click', () => (location.hash = '#trends'));
  elements.heroBtn      ?.addEventListener('click', () => (location.hash = '#trends'));
  elements.closeModalBtn?.addEventListener('click', closeTrailerModal);

  document.body.addEventListener('click', delegateCards, { passive:true });
}

/* ═════════ 2. ROUTER ═════════ */
async function handleRoute () {
  resetView(); detachObserver();

  const h = location.hash;
  if      (h.startsWith('#movie='))    await loadMovieDetail(h.slice(7));
  else if (h.startsWith('#category=')) {
    const [id,name] = h.slice(10).split('-');
    await loadCategoryPage(id, decodeURIComponent(name));
  }
  else if (h.startsWith('#search='))   await loadSearchPage(decodeURIComponent(h.slice(8)));
  else if (h === '#trends')            await loadTrendingPage();
  else                                 await loadHomePage();
}

/* ═════════ 3. PÁGINAS ═════════ */
async function loadHomePage () {
  elements.headerTitle.classList.remove('inactive');
  elements.heroSection     .classList.remove('inactive');
  elements.trendingSection .classList.remove('inactive');
  elements.categoriesSection.classList.remove('inactive');

  // Cargar películas trending con skeleton
  const moviesPromise = getTrendingMovies().then(toMovies);
  const movies = await renderListWithLoading(
    moviesPromise,
    createMovieCard,
    elements.trendingMoviesList,
    showMoviesSkeleton,
    6,
    true // horizontal layout
  );
  movies.forEach(m => shownIds.add(m.id));

  // Cargar categorías con skeleton
  await renderListWithLoading(
    getCategories(),
    createCategoryCard,
    elements.categoriesList,
    showCategoriesSkeleton,
    8
  );
}

async function loadCategoryPage (id, name) {
  elements.headerCategoryTitle.textContent = name;
  showGeneric();

  // Cargar películas por categoría con skeleton
  const moviesPromise = getMoviesByCategory(id).then(data => data.results);
  await renderListWithLoading(
    moviesPromise,
    createMovieCard,
    elements.moviesGrid,
    showMoviesSkeleton,
    12
  );
}

async function loadSearchPage (query) {
  elements.headerCategoryTitle.textContent = `Resultados: ${query}`;
  showGeneric();

  // Cargar resultados de búsqueda con skeleton
  const searchPromise = searchMovies(query).then(data => data.results);
  await renderListWithLoading(
    searchPromise,
    createMovieCard,
    elements.moviesGrid,
    showMoviesSkeleton,
    12
  );
}

async function loadTrendingPage () {
  elements.headerCategoryTitle.textContent = 'Tendencias';
  showGeneric();

  page = 1; shownIds.clear();
  
  // Cargar página de tendencias con skeleton
  const trendingPromise = getTrendingMovies('week', page).then(res => {
    const movies = orderByDate(toMovies(res));
    maxPage = res.total_pages ?? Infinity;
    return movies;
  });
  
  const movies = await renderListWithLoading(
    trendingPromise,
    createMovieCard,
    elements.moviesGrid,
    showMoviesSkeleton,
    16
  );
  
  movies.forEach(m => shownIds.add(m.id));
  createSentinel();
}

async function loadMovieDetail (id) {
  showDetail();
  
  // Mostrar skeleton completo para detalle de película
  showMovieDetailSkeleton(elements.movieDetailSection);
  
  try {
    const m = await getMovieDetails(id);
    
    // Pequeño delay para mostrar skeleton
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Ocultar skeleton con fade out
    hideSkeleton(elements.movieDetailSection, true);
    
    // Mostrar contenido real después del fade out
    setTimeout(() => {
      elements.movieDetailSection.innerHTML = `
        <div class="movie-detail__hero"></div>
        <div class="container">
          <div class="movie-detail__content">
            <div class="movie-detail__poster">
              <img id="moviePoster" src="" alt="Poster de la película" class="movie-poster"/>
            </div>
            <div class="movie-detail__info">
              <h1 id="movieDetailTitle" class="movie-title"></h1>
              <div class="movie-meta">
                <span id="movieRating" class="movie-rating"></span>
                <span id="movieRuntime" class="movie-runtime"></span>
                <span id="movieYear" class="movie-year"></span>
              </div>
              <div id="movieTags" class="movie-tags"></div>
              <div id="movieExtra" class="movie-extra"></div>
              <div class="movie-synopsis">
                <h3>Sinopsis</h3>
                <p id="movieDescription"></p>
              </div>
              <div class="movie-credits">
                <h3>Reparto principal</h3>
                <div id="movieCast" class="cast-grid"></div>
              </div>
              <div class="movie-actions">
                <button id="watchTrailerBtn" class="btn btn--primary watch-trailer-btn">
                  <i class="fas fa-play"></i> Ver tráiler
                </button>
              </div>
            </div>
          </div>
          <div id="trailerModal" class="trailer-modal inactive">
            <div class="trailer-modal__content">
              <button id="closeModalBtn" class="trailer-modal__close" aria-label="Cerrar tráiler">
                <i class="fas fa-times"></i>
              </button>
              <div id="trailerContainer" class="trailer-container"></div>
            </div>
          </div>
          <div class="similar-movies">
            <h3 class="similar-movies__title">Películas similares</h3>
            <div id="similarMoviesList" class="similar-movies__list"></div>
          </div>
        </div>
      `;
      
      // Reactivar referencias a elementos
      elements.movieDetailHero = document.querySelector('.movie-detail__hero');
      elements.moviePoster = document.getElementById('moviePoster');
      elements.movieDetailTitle = document.getElementById('movieDetailTitle');
      elements.movieRating = document.getElementById('movieRating');
      elements.movieRuntime = document.getElementById('movieRuntime');
      elements.movieYear = document.getElementById('movieYear');
      elements.movieTags = document.getElementById('movieTags');
      elements.movieDescription = document.getElementById('movieDescription');
      elements.castGrid = document.getElementById('movieCast');
      elements.watchTrailerBtn = document.getElementById('watchTrailerBtn');
      elements.similarMoviesList = document.getElementById('similarMoviesList');
      elements.trailerModal = document.getElementById('trailerModal');
      elements.trailerContainer = document.getElementById('trailerContainer');
      
      // Cargar contenido
      elements.movieDetailHero.style.backgroundImage =
        `url(${getFullImageUrl(m.backdrop_path,'original')})`;
      elements.moviePoster.src = getFullImageUrl(m.poster_path,'w500');
      elements.moviePoster.onerror = () => (elements.moviePoster.src='./src/img/no-image.jpg');

      elements.movieDetailTitle.textContent = m.title;
      elements.movieRating .innerHTML = `<i class="fas fa-star"></i> ${m.vote_average?.toFixed(1)||'N/A'} (${m.vote_count})`;
      elements.movieRuntime.innerHTML = `<i class="fas fa-clock"></i> ${m.runtime||'N/A'} min`;
      elements.movieYear   .innerHTML = `<i class="fas fa-calendar-alt"></i> ${m.release_date?.split('-')[0]||'N/A'}`;

      elements.movieTags.innerHTML     = m.genres.map(g=>`<span class="tag">${g.name}</span>`).join('');
      elements.movieDescription.textContent = m.overview || 'Sin descripción disponible.';

      // Cargar reparto con skeleton
      showCastSkeleton(elements.castGrid, 8);
      setTimeout(() => {
        hideSkeleton(elements.castGrid, true);
        setTimeout(() => {
          renderList(m.cast, createCastCard, elements.castGrid);
        }, 300);
      }, 300);

      // Cargar películas similares con skeleton
      showMoviesSkeleton(elements.similarMoviesList, 6, true);
      setTimeout(() => {
        hideSkeleton(elements.similarMoviesList, true);
        setTimeout(() => {
          renderList(m.similar, createMovieCard, elements.similarMoviesList);
          elements.similarMoviesList.classList.add('mb-footer');
        }, 300);
      }, 600);

      const tKey = m.videos.find(v=>v.type==='Trailer')?.key;
      elements.watchTrailerBtn.style.display = tKey ? 'inline-flex' : 'none';
      if (tKey) elements.watchTrailerBtn.onclick = () => openTrailerModal(tKey);

      // Scroll al inicio al cargar detalles
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
    
  } catch (error) {
    hideSkeleton(elements.movieDetailSection, false);
    elements.movieDetailSection.innerHTML = '<p class="error-message">Error cargando detalles de la película</p>';
  }
}

/* ═════════ 4. INFINITE SCROLL (IntersectionObserver) ═════════ */
function createSentinel () {
  const sentinel = document.createElement('div');
  sentinel.id = 'infinite-sentinel';
  elements.moviesGrid.appendChild(sentinel);

  observer = new IntersectionObserver(loadNextPage, {
    rootMargin: '600px 0px',
    threshold : 0,
  });
  observer.observe(sentinel);
}

async function loadNextPage (entries) {
  if (!entries[0].isIntersecting) return;
  if (page >= maxPage) { detachObserver(); return; }

  // Mostrar skeleton para nuevas películas
  const loadingSkeletons = Array(6).fill(0).map(() => createMovieCardSkeleton()).join('');
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = loadingSkeletons;
  tempContainer.className = 'infinite-loading-container';
  
  // Insertar skeleton antes del sentinel
  const sentinel = document.getElementById('infinite-sentinel');
  if (sentinel) {
    elements.moviesGrid.insertBefore(tempContainer, sentinel);
  }

  await new Promise(r => setTimeout(r, 600));  // pausa para mostrar skeleton
  page += 1;

  try {
    const res   = await getTrendingMovies('week', page);
    maxPage     = res.total_pages ?? maxPage;
    const fresh = orderByDate(toMovies(res)).filter(m => !shownIds.has(m.id));

    // Remover skeleton
    tempContainer.remove();

    if (!fresh.length) return;                  // si la página sólo trae repetidos, espera

    fresh.forEach(m => {
      appendCard(createMovieCard(m));
      shownIds.add(m.id);
    });

    /* ⬅️  recoloca el sentinel al final del grid para seguir observando */
    if (sentinel) elements.moviesGrid.appendChild(sentinel);
  } catch (error) {
    // Remover skeleton en caso de error
    tempContainer.remove();
    console.error('Error cargando más películas:', error);
  }
}

/* ═════════ helpers ═════════ */
function toMovies(res){ return Array.isArray(res) ? res : res.results ?? []; }
function orderByDate(arr){ return [...arr].sort((a,b)=>(b.release_date||'').localeCompare(a.release_date||'')); }
function appendCard(c){ c && (c.nodeType ? elements.moviesGrid.appendChild(c) : elements.moviesGrid.insertAdjacentHTML('beforeend', c)); }

function delegateCards(e){
  const m=e.target.closest('.movie-card'); if(m){ location.hash=`#movie=${m.dataset.id}`; return; }
  const c=e.target.closest('.category-card'); if(c){ const n=c.querySelector('.category-name').textContent; location.hash=`#category=${c.dataset.id}-${encodeURIComponent(n)}`; }
}

/* ═════════ VISTA / OBSERVER MANAGMENT ═════════ */
function resetView (){
  [elements.heroSection,elements.trendingSection,elements.categoriesSection,
   elements.genericListSection,elements.movieDetailSection]
   .forEach(el=>el.classList.add('inactive'));
  elements.headerBackBtn.classList.add('inactive');
  elements.headerTitle.classList.remove('inactive');
  elements.headerCategoryTitle.classList.add('inactive');
}
function showGeneric (){
  elements.genericListSection.classList.remove('inactive');
  elements.headerBackBtn.classList.remove('inactive');
  elements.headerTitle.classList.add('inactive');
  elements.headerCategoryTitle.classList.remove('inactive');
}
function showDetail (){
  elements.movieDetailSection.classList.remove('inactive');
  elements.headerBackBtn.classList.remove('inactive');
  elements.headerTitle.classList.add('inactive');
  elements.headerCategoryTitle.classList.add('inactive');
}
function detachObserver (){
  observer?.disconnect(); observer = null;
}
