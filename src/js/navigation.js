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
  getRecommendationsForMovie,
  getFullImageUrl,
  getPopularSagas,
  getSagaMovies,
} from './api.js';

import {
  elements,
  createMovieCard,
  createCategoryCard,
  createSagaCard,
  createCastCard,
  createCrewCard,
  createReviewCard,
  createKeywordTag,
  createImageGalleryItem,
  formatCurrency,
  formatNumber,
  renderList,
  renderListWithLoading,
  showMoviesSkeleton,
  showCategoriesSkeleton,
  showSagasSkeleton,
  showCastSkeleton,
  showMovieDetailSkeleton,
  hideSkeleton,
  renderPagination,
  updatePaginationState,
  scrollToTop,
  getPageFromHash,
  updateHashWithPage,
} from './dom.js';

import { openTrailerModal, closeTrailerModal, setupTrailerModal } from './trailerModal.js';
import { initializeHeroBackground, getHeroBackgroundManager } from './heroBackground.js';

/* ─── ESTADO GLOBAL ─────────────────────────────────────────── */
let page = 1;
let maxPage = 1;
const shownIds = new Set();
let observer;                       // IntersectionObserver
let infiniteScrollEnabled = false; // Estado del scroll infinito (por defecto paginación)
let currentListType = null;        // 'category', 'search', 'trends'
let currentListId = null;          // ID de categoría o query de búsqueda

/* ═════════ 1. LISTENERS ═════════ */
export function setupNavigation () {
  window.addEventListener('DOMContentLoaded', handleRoute, { passive:true });
  window.addEventListener('hashchange',       handleRoute, { passive:true });

  elements.headerBackBtn?.addEventListener('click', () => history.back());
  elements.viewAllBtn   ?.addEventListener('click', () => (location.hash = '#trends'));
  elements.viewAllSagasBtn?.addEventListener('click', () => (location.hash = '#sagas'));
  elements.heroBtn      ?.addEventListener('click', () => (location.hash = '#trends'));
  
  // Configurar modal de tráiler inicial
  setupTrailerModal();

  document.body.addEventListener('click', delegateCards, { passive:true });

  // Listener para toggle de scroll infinito
  document.addEventListener('infiniteScrollToggle', (e) => {
    infiniteScrollEnabled = e.detail.enabled;
    if (infiniteScrollEnabled) {
      enableInfiniteScroll();
    } else {
      disableInfiniteScroll();
    }
  });
}

/* ═════════ 2. ROUTER ═════════ */
async function handleRoute () {
  resetView(); detachObserver();

  const h = location.hash;
  if      (h.startsWith('#movie='))    await loadMovieDetail(h.slice(7));
  else if (h.startsWith('#category=')) {
    const [id,name] = h.slice(10).split('-');
    // Limpiar el nombre de parámetros de paginación
    const cleanName = decodeURIComponent(name).split('?')[0];
    await loadCategoryPage(id, cleanName);
  }
  else if (h.startsWith('#saga='))     {
    const sagaId = h.slice(6);
    await loadSagaPage(sagaId);
  }
  else if (h.startsWith('#search='))   {
    const query = decodeURIComponent(h.slice(8));
    // Limpiar el query de parámetros de paginación
    const cleanQuery = query.split('?')[0];
    await loadSearchPage(cleanQuery);
  }
  else if (h.startsWith('#trends'))    await loadTrendingPage();
  else if (h.startsWith('#sagas'))     await loadSagasPage();
  else                                 await loadHomePage();
}

/* ═════════ 3. PÁGINAS ═════════ */
async function loadHomePage () {
  elements.headerTitle.classList.remove('inactive');
  elements.heroSection     .classList.remove('inactive');
  elements.trendingSection .classList.remove('inactive');
  elements.categoriesSection.classList.remove('inactive');
  elements.sagasSection.classList.remove('inactive');

  // Cargar películas trending con skeleton
  const moviesPromise = getTrendingMovies().then(res => orderByDate(toMovies(res)));
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

  // Cargar sagas con skeleton
  await renderListWithLoading(
    loadSagasData(),
    createSagaCard,
    elements.sagasList,
    showSagasSkeleton,
    6
  );

  // Inicializar backgrounds dinámicos del hero
  setTimeout(() => {
    initializeHeroBackground();
  }, 500); // Pequeño delay para que se cargue todo primero
}

async function loadCategoryPage (id, name) {
  // Scroll automático al inicio de página
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Limpiar el nombre de cualquier parámetro residual
  const cleanName = cleanTitle(name);
  elements.pageTitleText.textContent = cleanName;
  showGeneric();

  // Configurar estado para paginación
  currentListType = 'category';
  currentListId = id;
  
  // Obtener página del hash
  const currentPage = getPageFromHash(location.hash);
  
  try {
    // Mostrar skeleton mientras se cargan los datos
    showMoviesSkeleton(elements.moviesGrid, 12);
    
    // Cargar películas por categoría
    const fullData = await getMoviesByCategory(id, currentPage);
    
    // Aplicar ordenamiento estricto por fecha
    fullData.results = orderByDate(fullData.results || []);
    
    // Pequeño delay para mostrar skeleton
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Ocultar skeleton con fade out
    hideSkeleton(elements.moviesGrid, true);
    
    // Renderizar resultados después del fade out
    setTimeout(() => {
      renderList(fullData.results, createMovieCard, elements.moviesGrid);
    }, 300);

    // Configurar paginación
    setupPaginationForCategory(id, cleanName, fullData, currentPage);
  } catch (error) {
    hideSkeleton(elements.moviesGrid, false);
    elements.moviesGrid.innerHTML = '<p class="error-message">Error cargando películas de la categoría</p>';
    console.error('Error cargando categoría:', error);
  }
}

async function loadSearchPage (query) {
  // Scroll automático al inicio de página
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Limpiar el query de cualquier parámetro residual
  const cleanQuery = query.split('?')[0];
  elements.pageTitleText.textContent = `Resultados: ${cleanQuery}`;
  showGeneric();

  // Configurar estado para paginación
  currentListType = 'search';
  currentListId = cleanQuery;
  
  // Obtener página del hash
  const currentPage = getPageFromHash(location.hash);

  try {
    // Mostrar skeleton mientras se cargan los datos
    showMoviesSkeleton(elements.moviesGrid, 12);
    
    // Cargar resultados de búsqueda
    const fullData = await searchMovies(cleanQuery, currentPage);
    
    // Aplicar ordenamiento estricto por fecha
    fullData.results = orderByDate(fullData.results || []);
    
    // Pequeño delay para mostrar skeleton
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Ocultar skeleton con fade out
    hideSkeleton(elements.moviesGrid, true);
    
    // Renderizar resultados después del fade out
    setTimeout(() => {
      renderList(fullData.results, createMovieCard, elements.moviesGrid);
    }, 300);

    // Configurar paginación
    setupPaginationForSearch(cleanQuery, fullData, currentPage);
  } catch (error) {
    hideSkeleton(elements.moviesGrid, false);
    elements.moviesGrid.innerHTML = '<p class="error-message">Error cargando resultados de búsqueda</p>';
    console.error('Error cargando búsqueda:', error);
  }
}

async function loadTrendingPage () {
  // Scroll automático al inicio de página
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  elements.pageTitleText.textContent = 'Tendencias';
  showGeneric();

  // Configurar estado para paginación
  currentListType = 'trends';
  currentListId = null;
  
  // Obtener página del hash
  const currentPage = getPageFromHash(location.hash);
  page = currentPage;
  shownIds.clear();
  
  try {
    // Mostrar skeleton mientras se cargan los datos
    showMoviesSkeleton(elements.moviesGrid, 16);
    
    // Cargar página de tendencias
    const res = await getTrendingMovies('week', currentPage);
    maxPage = res.total_pages ?? Infinity;
    const movies = orderByDate(toMovies(res));
    const data = { ...res, results: movies };
    
    // Pequeño delay para mostrar skeleton
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Ocultar skeleton con fade out
    hideSkeleton(elements.moviesGrid, true);
    
    // Renderizar resultados después del fade out
    setTimeout(() => {
      renderList(data.results, createMovieCard, elements.moviesGrid);
    }, 300);
    
    data.results.forEach(m => shownIds.add(m.id));
    
    // Configurar paginación
    setupPaginationForTrending(data, currentPage);
  } catch (error) {
    hideSkeleton(elements.moviesGrid, false);
    elements.moviesGrid.innerHTML = '<p class="error-message">Error cargando tendencias</p>';
    console.error('Error cargando tendencias:', error);
  }
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
              <div class="movie-detail__external-links">
                <a id="imdbLink" href="#" target="_blank" class="external-link" style="display: none;">
                  <i class="fab fa-imdb"></i> IMDb
                </a>
                <a id="homepageLink" href="#" target="_blank" class="external-link" style="display: none;">
                  <i class="fas fa-external-link-alt"></i> Sitio Web
                </a>
              </div>
            </div>
            <div class="movie-detail__info">
              <div class="movie-header">
                <h1 id="movieDetailTitle" class="movie-title"></h1>
                <p id="movieTagline" class="movie-tagline"></p>
                <p id="movieOriginalTitle" class="movie-original-title"></p>
              </div>
              
              <div class="movie-meta">
                <span id="movieRating" class="movie-rating"></span>
                <span id="movieRuntime" class="movie-runtime"></span>
                <span id="movieYear" class="movie-year"></span>
                <span id="movieStatus" class="movie-status"></span>
              </div>
              
              <div class="movie-meta-extended">
                <div class="meta-item">
                  <strong>Idioma original:</strong> <span id="movieOriginalLanguage"></span>
                </div>
                <div class="meta-item">
                  <strong>Idiomas hablados:</strong> <span id="movieSpokenLanguages"></span>
                </div>
                <div class="meta-item">
                  <strong>Países de producción:</strong> <span id="movieCountries"></span>
                </div>
                <div class="meta-item">
                  <strong>Popularidad:</strong> <span id="moviePopularity"></span>
                </div>
              </div>

              <div id="movieTags" class="movie-tags"></div>
              
              <div class="movie-financial-info">
                <h3>Información Financiera</h3>
                <div class="financial-grid">
                  <div class="financial-item">
                    <strong>Presupuesto:</strong>
                    <span id="movieBudget"></span>
                  </div>
                  <div class="financial-item">
                    <strong>Recaudación:</strong>
                    <span id="movieRevenue"></span>
                  </div>
                  <div class="financial-item">
                    <strong>Beneficio:</strong>
                    <span id="movieProfit"></span>
                  </div>
                </div>
              </div>

              <div class="movie-synopsis">
                <h3>Sinopsis</h3>
                <p id="movieDescription"></p>
              </div>

              <div class="movie-keywords">
                <h3>Palabras Clave</h3>
                <div id="movieKeywords" class="keywords-container"></div>
              </div>

              <div class="movie-actions">
                <button id="watchTrailerBtn" class="btn btn--primary watch-trailer-btn">
                  <i class="fas fa-play"></i> Ver tráiler
                </button>
              </div>
            </div>
          </div>

          <div class="movie-crew-section">
            <h3>Equipo Técnico</h3>
            <div class="crew-roles">
              <div class="crew-role">
                <strong>Director:</strong> <span id="movieDirector"></span>
              </div>
              <div class="crew-role">
                <strong>Productores:</strong> <span id="movieProducers"></span>
              </div>
              <div class="crew-role">
                <strong>Guionistas:</strong> <span id="movieWriters"></span>
              </div>
              <div class="crew-role">
                <strong>Director de Fotografía:</strong> <span id="movieCinematographer"></span>
              </div>
              <div class="crew-role">
                <strong>Compositor Musical:</strong> <span id="movieMusicComposer"></span>
              </div>
            </div>
          </div>

          <div class="movie-companies">
            <h3>Compañías Productoras</h3>
            <div id="movieCompanies" class="companies-list"></div>
          </div>

          <div class="movie-credits">
            <h3>Reparto Principal</h3>
            <div id="movieCast" class="cast-grid"></div>
          </div>

          <div class="movie-gallery">
            <h3>Galería de Imágenes</h3>
            <div class="gallery-tabs">
              <button class="gallery-tab active" data-tab="backdrops">Fondos</button>
              <button class="gallery-tab" data-tab="posters">Pósters</button>
            </div>
            <div id="movieBackdrops" class="gallery-grid active"></div>
            <div id="moviePosters" class="gallery-grid"></div>
          </div>

          <div class="movie-reviews">
            <h3>Reseñas de Usuarios</h3>
            <div id="movieReviews" class="reviews-container"></div>
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
            <h3 class="similar-movies__title">Películas Similares</h3>
            <div id="similarMoviesList" class="similar-movies__list"></div>
          </div>

          <div class="recommendations">
            <h3 class="recommendations__title">Recomendaciones</h3>
            <div id="recommendationsList" class="recommendations__list"></div>
          </div>
        </div>
      `;
      
      // Reactivar referencias a elementos básicos
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
      
      // Referencias a nuevos elementos
      const movieTagline = document.getElementById('movieTagline');
      const movieOriginalTitle = document.getElementById('movieOriginalTitle');
      const movieStatus = document.getElementById('movieStatus');
      const movieOriginalLanguage = document.getElementById('movieOriginalLanguage');
      const movieSpokenLanguages = document.getElementById('movieSpokenLanguages');
      const movieCountries = document.getElementById('movieCountries');
      const moviePopularity = document.getElementById('moviePopularity');
      const movieBudget = document.getElementById('movieBudget');
      const movieRevenue = document.getElementById('movieRevenue');
      const movieProfit = document.getElementById('movieProfit');
      const movieKeywords = document.getElementById('movieKeywords');
      const movieDirector = document.getElementById('movieDirector');
      const movieProducers = document.getElementById('movieProducers');
      const movieWriters = document.getElementById('movieWriters');
      const movieCinematographer = document.getElementById('movieCinematographer');
      const movieMusicComposer = document.getElementById('movieMusicComposer');
      const movieCompanies = document.getElementById('movieCompanies');
      const movieBackdrops = document.getElementById('movieBackdrops');
      const moviePosters = document.getElementById('moviePosters');
      const movieReviews = document.getElementById('movieReviews');
      const recommendationsList = document.getElementById('recommendationsList');
      const imdbLink = document.getElementById('imdbLink');
      const homepageLink = document.getElementById('homepageLink');
      
      // Cargar contenido básico
      elements.movieDetailHero.style.backgroundImage =
        `url(${getFullImageUrl(m.backdrop_path,'original')})`;
      elements.moviePoster.src = getFullImageUrl(m.poster_path,'w500');
      elements.moviePoster.onerror = () => (elements.moviePoster.src='./src/img/no-image.jpg');

      // Información principal
      elements.movieDetailTitle.textContent = m.title;
      movieTagline.textContent = m.tagline || '';
      movieTagline.style.display = m.tagline ? 'block' : 'none';
      movieOriginalTitle.textContent = m.originalTitle !== m.title ? `Título original: ${m.originalTitle}` : '';
      movieOriginalTitle.style.display = m.originalTitle !== m.title ? 'block' : 'none';

      // Meta información básica
      elements.movieRating.innerHTML = `<i class="fas fa-star"></i> ${m.vote_average?.toFixed(1)||'N/A'} (${formatNumber(m.voteCount)})`;
      elements.movieRuntime.innerHTML = `<i class="fas fa-clock"></i> ${m.runtime||'N/A'} min`;
      elements.movieYear.innerHTML = `<i class="fas fa-calendar-alt"></i> ${m.release_date?.split('-')[0]||'N/A'}`;
      movieStatus.innerHTML = `<i class="fas fa-info-circle"></i> ${m.status}`;

      // Meta información extendida
      movieOriginalLanguage.textContent = m.originalLanguage?.toUpperCase() || 'N/A';
      movieSpokenLanguages.textContent = m.spokenLanguages.length > 0 ? m.spokenLanguages.join(', ') : 'No disponible';
      movieCountries.textContent = m.productionCountries.length > 0 ? m.productionCountries.join(', ') : 'No disponible';
      moviePopularity.textContent = m.popularity ? m.popularity.toFixed(1) : 'N/A';

      // Información financiera
      movieBudget.textContent = formatCurrency(m.budget);
      movieRevenue.textContent = formatCurrency(m.revenue);
      movieProfit.textContent = formatCurrency(m.profit);
      movieProfit.style.color = m.profit > 0 ? 'var(--success-color, #4CAF50)' : m.profit < 0 ? 'var(--error-color, #f44336)' : 'inherit';

      // Enlaces externos
      if (m.imdbId) {
        imdbLink.href = `https://www.imdb.com/title/${m.imdbId}`;
        imdbLink.style.display = 'inline-flex';
      }
      if (m.homepage) {
        homepageLink.href = m.homepage;
        homepageLink.style.display = 'inline-flex';
      }

      // Géneros y palabras clave
      elements.movieTags.innerHTML = m.genres.map(g => `<span class="tag">${g.name}</span>`).join('');
      movieKeywords.innerHTML = m.keywords.length > 0 ? 
        m.keywords.map(createKeywordTag).join('') : 
        '<p class="no-content">No hay palabras clave disponibles</p>';

      // Sinopsis
      elements.movieDescription.textContent = m.overview || 'Sin descripción disponible.';

      // Equipo técnico
      movieDirector.textContent = m.director;
      movieProducers.textContent = m.producers.length > 0 ? m.producers.join(', ') : 'No disponible';
      movieWriters.textContent = m.writers.length > 0 ? m.writers.join(', ') : 'No disponible';
      movieCinematographer.textContent = m.cinematographer || 'No disponible';
      movieMusicComposer.textContent = m.musicComposer || 'No disponible';

      // Compañías productoras
      if (m.productionCompanies.length > 0) {
        movieCompanies.innerHTML = m.productionCompanies.map(company => 
          `<div class="company-item">
            ${company.logo_path ? 
              `<img src="${getFullImageUrl(company.logo_path, 'w154')}" alt="${company.name}" class="company-logo">` : 
              `<div class="company-logo-placeholder"><i class="fas fa-building"></i></div>`
            }
            <span class="company-name">${company.name}</span>
          </div>`
        ).join('');
      } else {
        movieCompanies.innerHTML = '<p class="no-content">No hay información de compañías productoras</p>';
      }

      // Cargar galería de imágenes
      if (m.backdrops.length > 0) {
        movieBackdrops.innerHTML = m.backdrops.map(img => createImageGalleryItem(img, 'backdrop')).join('');
      } else {
        movieBackdrops.innerHTML = '<p class="no-content">No hay imágenes de fondo disponibles</p>';
      }

      if (m.posters.length > 0) {
        moviePosters.innerHTML = m.posters.map(img => createImageGalleryItem(img, 'poster')).join('');
      } else {
        moviePosters.innerHTML = '<p class="no-content">No hay pósters adicionales disponibles</p>';
      }

      // Configurar tabs de galería
      const galleryTabs = document.querySelectorAll('.gallery-tab');
      const galleryGrids = document.querySelectorAll('.gallery-grid');
      
      galleryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          galleryTabs.forEach(t => t.classList.remove('active'));
          galleryGrids.forEach(g => g.classList.remove('active'));
          
          tab.classList.add('active');
          const targetTab = tab.dataset.tab;
          document.getElementById(`movie${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}`).classList.add('active');
        });
      });

      // Cargar reseñas
      if (m.reviews.length > 0) {
        movieReviews.innerHTML = m.reviews.map(createReviewCard).join('');
      } else {
        movieReviews.innerHTML = '<p class="no-content">No hay reseñas de usuarios disponibles</p>';
      }

      // Cargar reparto con skeleton
      showCastSkeleton(elements.castGrid, 15);
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
        setTimeout(async () => {
          let similarMovies = m.similar || [];
          
          // Aplicar ordenamiento estricto por fecha a películas similares
          const sortedSimilar = orderByDate(similarMovies);
          
          // Validación estricta: si no hay suficientes películas similares, obtener más
          if (sortedSimilar.length < 3) {
            try {
              // Fallback inteligente: obtener recomendaciones basadas en género
              const recommendations = await getRecommendationsForMovie(m.id, m.genres || [], 1);
              const additionalMovies = orderByDate(toMovies(recommendations))
                .filter(movie => 
                  movie.id !== parseInt(m.id) && // No incluir la película actual
                  !sortedSimilar.some(sim => sim.id === movie.id) && // No duplicar
                  movie.poster_path && 
                  movie.release_date &&
                  movie.vote_average > 0 &&
                  movie.overview && // Debe tener sinopsis
                  movie.title // Debe tener título
                )
                .slice(0, 6 - sortedSimilar.length); // Completar hasta 6 películas
              
              similarMovies = [...sortedSimilar, ...additionalMovies];
            } catch (error) {
              console.warn('Error obteniendo recomendaciones para similares:', error);
              similarMovies = sortedSimilar;
            }
          } else {
            similarMovies = sortedSimilar.slice(0, 6); // Limitar a 6 películas
          }
          
          // Renderizar películas similares o mensaje si no hay ninguna
          if (similarMovies.length > 0) {
            renderList(similarMovies, createMovieCard, elements.similarMoviesList);
          } else {
            elements.similarMoviesList.innerHTML = `
              <div class="no-similar-movies">
                <p>No se encontraron películas similares disponibles.</p>
              </div>
            `;
          }
          
          elements.similarMoviesList.classList.add('mb-footer');
        }, 300);
      }, 600);

      // Cargar recomendaciones
      setTimeout(() => {
        if (m.recommendations && m.recommendations.length > 0) {
          const sortedRecommendations = orderByDate(m.recommendations);
          renderList(sortedRecommendations, createMovieCard, recommendationsList);
        } else {
          recommendationsList.innerHTML = '<p class="no-content">No hay recomendaciones disponibles</p>';
        }
      }, 900);

      // Configurar modal de tráiler
      setupTrailerModal();
      
      const tKey = m.videos.find(v=>v.type==='Trailer')?.key;
      elements.watchTrailerBtn.style.display = tKey ? 'inline-flex' : 'none';
      if (tKey) {
        console.log('Configurando botón de tráiler con clave:', tKey);
        // Remover listener anterior si existe
        elements.watchTrailerBtn.onclick = null;
        // Limpiar listeners previos
        const newBtn = elements.watchTrailerBtn.cloneNode(true);
        elements.watchTrailerBtn.parentNode.replaceChild(newBtn, elements.watchTrailerBtn);
        elements.watchTrailerBtn = newBtn;
        // Agregar nuevo listener
        elements.watchTrailerBtn.addEventListener('click', () => {
          console.log('Botón de tráiler clickeado');
          openTrailerModal(tKey);
        });
      } else {
        console.log('No se encontró tráiler para esta película');
      }

      // Scroll al inicio al cargar detalles
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
    
  } catch (error) {
    hideSkeleton(elements.movieDetailSection, false);
    elements.movieDetailSection.innerHTML = '<p class="error-message">Error cargando detalles de la película</p>';
  }
}

async function loadSagasPage() {
  // Scroll automático al inicio de página
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  elements.pageTitleText.innerHTML = '🎬 <span class="saga-title-gradient">SAGAS Y FRANQUICIAS</span> - Colecciones Épicas';
  showGeneric();

  try {
    // Mostrar skeleton mientras se cargan los datos
    showSagasSkeleton(elements.moviesGrid, 20);
    
    // Cargar todas las sagas
    const sagasData = await loadSagasData();
    
    // Pequeño delay para mostrar skeleton
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Ocultar skeleton con fade out
    hideSkeleton(elements.moviesGrid, true);
    
    // Renderizar sagas después del fade out
    setTimeout(() => {
      renderList(sagasData, createSagaCard, elements.moviesGrid);
    }, 300);
  } catch (error) {
    hideSkeleton(elements.moviesGrid, false);
    elements.moviesGrid.innerHTML = '<p class="error-message">Error cargando sagas</p>';
    console.error('Error cargando sagas:', error);
  }
}

async function loadSagaPage(sagaId) {
  try {
    // Scroll automático al inicio de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Obtener datos de la saga
    const sagas = await getPopularSagas();
    const sagaData = sagas.find(s => s.id == sagaId);
    
    if (!sagaData) {
      elements.moviesGrid.innerHTML = '<p class="error-message">Saga no encontrada</p>';
      return;
    }

    // Crear título llamativo para la saga
    const sagaTitle = getSagaDisplayTitle(sagaData.name);
    elements.pageTitleText.innerHTML = sagaTitle;
    showGeneric();

    // Mostrar skeleton mientras se cargan los datos
    showMoviesSkeleton(elements.moviesGrid, 12);
    
    // Cargar películas de la saga
    const sagaWithMovies = await getSagaMovies(sagaData);
    
    // Pequeño delay para mostrar skeleton
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Ocultar skeleton con fade out
    hideSkeleton(elements.moviesGrid, true);
    
    // Renderizar películas después del fade out
    setTimeout(() => {
      if (sagaWithMovies.movies && sagaWithMovies.movies.length > 0) {
        renderList(sagaWithMovies.movies, createMovieCard, elements.moviesGrid);
      } else {
        elements.moviesGrid.innerHTML = '<p class="error-message">No se encontraron películas para esta saga</p>';
      }
    }, 300);
  } catch (error) {
    hideSkeleton(elements.moviesGrid, false);
    elements.moviesGrid.innerHTML = '<p class="error-message">Error cargando películas de la saga</p>';
    console.error('Error cargando saga:', error);
  }
}

// Función para crear títulos llamativos para las sagas
function getSagaDisplayTitle(sagaName) {
  const sagaTitles = {
    'Matrix': '🔴 <span class="saga-title-gradient">MATRIX</span> - La Realidad Virtual',
    'Rápido y Furioso': '🏎️ <span class="saga-title-gradient">FAST & FURIOUS</span> - Velocidad Extrema',
    'Soldado Universal': '🤖 <span class="saga-title-gradient">SOLDADO UNIVERSAL</span> - Cyborg Warfare',
    'Universo DC': '🦸 <span class="saga-title-gradient">DC COMICS</span> - Liga de la Justicia',
    'Universo Marvel': '⚡ <span class="saga-title-gradient">MARVEL</span> - Universo Cinematográfico',
    'James Bond': '🕴️ <span class="saga-title-gradient">JAMES BOND</span> - Agente 007',
    'Terminator': '🤖 <span class="saga-title-gradient">TERMINATOR</span> - Skynet Wars',
    'Jurassic Park': '🦕 <span class="saga-title-gradient">JURASSIC PARK</span> - Dinosaurios',
    'Pirates of the Caribbean': '🏴‍☠️ <span class="saga-title-gradient">PIRATAS DEL CARIBE</span> - Aventuras Marítimas',
    'Transformers': '🚗 <span class="saga-title-gradient">TRANSFORMERS</span> - Robots in Disguise',
    'Avengers': '🛡️ <span class="saga-title-gradient">AVENGERS</span> - Los Vengadores',
    'Star Wars': '⭐ <span class="saga-title-gradient">STAR WARS</span> - Galaxia Lejana',
    'Harry Potter': '⚡ <span class="saga-title-gradient">HARRY POTTER</span> - Mundo Mágico',
    'El Señor de los Anillos': '💍 <span class="saga-title-gradient">SEÑOR DE LOS ANILLOS</span> - Tierra Media',
    'Alien': '👽 <span class="saga-title-gradient">ALIEN</span> - Terror Espacial',
    'Halloween': '🎃 <span class="saga-title-gradient">HALLOWEEN</span> - Michael Myers',
    'Scream': '🔪 <span class="saga-title-gradient">SCREAM</span> - Ghostface Killer',
    'X-Men': '🧬 <span class="saga-title-gradient">X-MEN</span> - Mutantes',
    'John Wick': '🔫 <span class="saga-title-gradient">JOHN WICK</span> - Asesino Legendario',
    'Ocean\'s': '💰 <span class="saga-title-gradient">OCEAN\'S</span> - Maestros del Robo'
  };
  
  return sagaTitles[sagaName] || `🎬 <span class="saga-title-gradient">${sagaName.toUpperCase()}</span>`;
}

async function loadSagasData() {
  try {
    const sagas = await getPopularSagas();
    
    // Obtener datos básicos de cada saga (mostrar todas las sagas)
    const sagasWithData = await Promise.all(
      sagas.map(async (saga) => {
        try {
          const sagaWithMovies = await getSagaMovies(saga);
          return {
            ...saga,
            poster_path: sagaWithMovies.poster_path || sagaWithMovies.movies[0]?.poster_path,
            movieCount: sagaWithMovies.movies?.length || 0
          };
        } catch (error) {
          console.warn(`Error cargando saga ${saga.name}:`, error);
          // Mostrar la saga aunque falle, con imagen por defecto
          return {
            ...saga,
            poster_path: './src/img/no-image.jpg',
            movieCount: 1 // Mostrar como disponible
          };
        }
      })
    );

    // Mostrar todas las sagas, incluso las que fallan
    return sagasWithData;
  } catch (error) {
    console.error('Error cargando datos de sagas:', error);
    return [];
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
function orderByDate(arr) { 
  return [...arr].sort((a, b) => {
    // Ordenamiento estricto: más nueva primero, más antigua al final
    const dateA = a.release_date || '1900-01-01'; // Fecha por defecto para películas sin fecha
    const dateB = b.release_date || '1900-01-01';
    
    // Comparación descendente (más nueva primero)
    const comparison = dateB.localeCompare(dateA);
    
    // Si las fechas son iguales, ordenar por popularidad (vote_average) como criterio secundario
    if (comparison === 0) {
      return (b.vote_average || 0) - (a.vote_average || 0);
    }
    
    return comparison;
  }); 
}
function appendCard(c){ c && (c.nodeType ? elements.moviesGrid.appendChild(c) : elements.moviesGrid.insertAdjacentHTML('beforeend', c)); }

// Función para limpiar títulos de parámetros URL
function cleanTitle(title) {
  return title.split('?')[0].split('&')[0].trim();
}

function delegateCards(e){
  const m=e.target.closest('.movie-card'); if(m){ location.hash=`#movie=${m.dataset.id}`; return; }
  const c=e.target.closest('.category-card'); if(c){ const n=c.querySelector('.category-name').textContent; location.hash=`#category=${c.dataset.id}-${encodeURIComponent(n)}`; return; }
  const s=e.target.closest('.saga-card'); if(s){ location.hash=`#saga=${s.dataset.sagaId}`; return; }
}

/* ═════════ VISTA / OBSERVER MANAGMENT ═════════ */
function showDetail (){
  elements.movieDetailSection.classList.remove('inactive');
  elements.headerBackBtn.classList.remove('inactive');
  elements.headerTitle.classList.add('inactive');
  elements.pageTitle.classList.add('inactive');
}
function detachObserver (){
  observer?.disconnect(); observer = null;
}

/* ═════════ FUNCIONES DE PAGINACIÓN ═════════ */

function setupPaginationForCategory(categoryId, categoryName, data, currentPage) {
  const onPageChange = (newPage) => {
    scrollToTop();
    const baseHash = `#category=${categoryId}-${encodeURIComponent(categoryName)}`;
    const newHash = updateHashWithPage(baseHash, newPage);
    location.hash = newHash;
  };

  renderPagination(
    elements.paginationContainer,
    currentPage,
    data.total_pages,
    onPageChange,
    {
      totalResults: data.total_results,
      resultsPerPage: 20,
      infiniteScrollEnabled,
      showModeToggle: false // Solo para trending
    }
  );
}

function setupPaginationForSearch(query, data, currentPage) {
  const onPageChange = (newPage) => {
    scrollToTop();
    const baseHash = `#search=${encodeURIComponent(query)}`;
    const newHash = updateHashWithPage(baseHash, newPage);
    location.hash = newHash;
  };

  renderPagination(
    elements.paginationContainer,
    currentPage,
    data.total_pages,
    onPageChange,
    {
      totalResults: data.total_results,
      resultsPerPage: 20,
      infiniteScrollEnabled,
      showModeToggle: false // Solo para trending
    }
  );
}

function setupPaginationForTrending(data, currentPage) {
  const onPageChange = (newPage) => {
    scrollToTop();
    const baseHash = '#trends';
    const newHash = updateHashWithPage(baseHash, newPage);
    location.hash = newHash;
  };

  renderPagination(
    elements.paginationContainer,
    currentPage,
    data.total_pages,
    onPageChange,
    {
      totalResults: data.total_results,
      resultsPerPage: 20,
      infiniteScrollEnabled,
      showModeToggle: true // Permitir toggle de scroll infinito
    }
  );

  // Configurar visualización basada en el modo de scroll
  if (infiniteScrollEnabled) {
    // Ocultar paginación y mostrar scroll infinito
    if (elements.paginationContainer) {
      elements.paginationContainer.style.display = 'none';
    }
    createSentinel();
  } else {
    // Mostrar paginación normal
    if (elements.paginationContainer) {
      elements.paginationContainer.style.display = 'block';
    }
  }
}

/* ═════════ FUNCIONES DE SCROLL INFINITO ═════════ */

function enableInfiniteScroll() {
  if (currentListType === 'trends') {
    // Ocultar paginación y mostrar scroll infinito
    if (elements.paginationContainer) {
      elements.paginationContainer.style.display = 'none';
    }
    createSentinel();
  }
}

function disableInfiniteScroll() {
  detachObserver();
  
  // Remover sentinel si existe
  const sentinel = document.getElementById('infinite-sentinel');
  if (sentinel) {
    sentinel.remove();
  }

  // Mostrar paginación
  if (elements.paginationContainer) {
    elements.paginationContainer.style.display = 'block';
  }
}

/* ═════════ ACTUALIZACIÓN DE VISTA PARA PAGINACIÓN ═════════ */

function resetView() {
  [elements.heroSection, elements.trendingSection, elements.categoriesSection,
   elements.sagasSection, elements.genericListSection, elements.movieDetailSection]
   .forEach(el => el.classList.add('inactive'));
  elements.headerBackBtn.classList.add('inactive');
  elements.headerTitle.classList.remove('inactive');
  elements.pageTitle.classList.add('inactive');
  
  // Limpiar paginación y asegurar que esté visible
  if (elements.paginationContainer) {
    elements.paginationContainer.innerHTML = '';
    elements.paginationContainer.style.display = 'block';
  }
  
  // Reset estado de scroll infinito
  detachObserver();
  
  // Limpiar background manager cuando no está en home
  const currentManager = getHeroBackgroundManager();
  if (currentManager && !elements.heroSection.classList.contains('inactive') === false) {
    // Solo destruir si no estamos en la página home
    const isGoingToHome = location.hash === '' || location.hash === '#' || location.hash === '#home';
    if (!isGoingToHome) {
      currentManager.destroy();
    }
  }
}

function showGeneric() {
  elements.genericListSection.classList.remove('inactive');
  elements.headerBackBtn.classList.remove('inactive');
  // NO ocultar el logo principal, mantenerlo siempre visible
  // elements.headerTitle.classList.add('inactive');
  elements.pageTitle.classList.remove('inactive');
}
