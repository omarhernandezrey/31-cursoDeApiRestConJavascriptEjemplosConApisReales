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

  const movies = toMovies(await getTrendingMovies());
  renderList(movies, createMovieCard, elements.trendingMoviesList);
  movies.forEach(m => shownIds.add(m.id));

  renderList(await getCategories(), createCategoryCard, elements.categoriesList);
}

async function loadCategoryPage (id, name) {
  elements.headerCategoryTitle.textContent = name;
  showGeneric();

  const { results } = await getMoviesByCategory(id);
  renderList(results, createMovieCard, elements.moviesGrid);
}

async function loadSearchPage (query) {
  elements.headerCategoryTitle.textContent = `Resultados: ${query}`;
  showGeneric();

  const { results } = await searchMovies(query);
  renderList(results, createMovieCard, elements.moviesGrid);
}

async function loadTrendingPage () {
  elements.headerCategoryTitle.textContent = 'Tendencias';
  showGeneric();

  page = 1; shownIds.clear();
  const res    = await getTrendingMovies('week', page);
  const movies = orderByDate(toMovies(res));
  maxPage      = res.total_pages ?? Infinity;

  renderList(movies, createMovieCard, elements.moviesGrid);
  movies.forEach(m => shownIds.add(m.id));

  createSentinel();
}

async function loadMovieDetail (id) {
  showDetail();
  const m = await getMovieDetails(id);

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

  renderList(m.cast,    createCastCard,  elements.castGrid);
  renderList(m.similar, createMovieCard, elements.similarMoviesList);

  // 👉 Agrega margen inferior entre películas similares y footer
  elements.similarMoviesList.classList.add('mb-footer');

  const tKey = m.videos.find(v=>v.type==='Trailer')?.key;
  elements.watchTrailerBtn.style.display = tKey ? 'inline-flex' : 'none';
  if (tKey) elements.watchTrailerBtn.onclick = () => openTrailerModal(tKey);

  // 👇 Scroll al inicio al cargar detalles
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

  await new Promise(r => setTimeout(r, 400));  // pausa suave
  page += 1;

  const res   = await getTrendingMovies('week', page);
  maxPage     = res.total_pages ?? maxPage;
  const fresh = orderByDate(toMovies(res)).filter(m => !shownIds.has(m.id));

  if (!fresh.length) return;                  // si la página sólo trae repetidos, espera

  fresh.forEach(m => {
    appendCard(createMovieCard(m));
    shownIds.add(m.id);
  });

  /* ⬅️  recoloca el sentinel al final del grid para seguir observando */
  const sentinel = document.getElementById('infinite-sentinel');
  if (sentinel) elements.moviesGrid.appendChild(sentinel);
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
