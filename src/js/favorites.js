/* ======================================================================
   src/js/favorites.js  -  Sistema de Favoritos Avanzado
   • Gestión completa de favoritos con localStorage
   • Manejo de eventos y notificaciones
   • Sincronización con UI
   ====================================================================== */

// Clave para localStorage
const FAVORITES_KEY = 'cineXpress_favorites';

// Estado global de favoritos
let favoriteMovies = new Map();

/* ═══════════════════════════════════════════════════════════════════════
   1. INICIALIZACIÓN Y CARGA DE FAVORITOS
   ═══════════════════════════════════════════════════════════════════════ */

export function initializeFavorites() {
  loadFavoritesFromStorage();
  updateFavoritesCounter();
}

function loadFavoritesFromStorage() {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      const favoritesArray = JSON.parse(stored);
      favoriteMovies = new Map(favoritesArray.map(movie => [movie.id, movie]));
    }
  } catch (error) {
    console.error('Error cargando favoritos desde localStorage:', error);
    favoriteMovies = new Map();
  }
}

function saveFavoritesToStorage() {
  try {
    const favoritesArray = Array.from(favoriteMovies.values());
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesArray));
  } catch (error) {
    console.error('Error guardando favoritos en localStorage:', error);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   2. GESTIÓN DE FAVORITOS
   ═══════════════════════════════════════════════════════════════════════ */

export function addToFavorites(movie) {
  if (!movie || !movie.id) {
    console.error('Película inválida para agregar a favoritos');
    return false;
  }

  // Crear objeto de película favorita con información completa
  const favoriteMovie = {
    id: movie.id,
    title: movie.title,
    original_title: movie.original_title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    overview: movie.overview,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    genre_ids: movie.genre_ids || [],
    popularity: movie.popularity,
    adult: movie.adult,
    original_language: movie.original_language,
    added_to_favorites_at: Date.now() // Timestamp de cuándo se agregó
  };

  favoriteMovies.set(movie.id, favoriteMovie);
  saveFavoritesToStorage();
  updateFavoritesCounter();
  
  // Actualizar UI de todos los botones de favoritos para esta película
  updateFavoriteButtonsUI(movie.id, true);
  
  // Mostrar notificación
  showFavoriteNotification(movie.title, true);
  return true;
}

export function removeFromFavorites(movieId) {
  if (!movieId) {
    console.error('ID de película inválido para remover de favoritos');
    return false;
  }

  const movie = favoriteMovies.get(movieId);
  if (movie) {
    favoriteMovies.delete(movieId);
    saveFavoritesToStorage();
    updateFavoritesCounter();
    
    // Actualizar UI de todos los botones de favoritos para esta película
    updateFavoriteButtonsUI(movieId, false);
    
    // Mostrar notificación
    showFavoriteNotification(movie.title, false);
    return true;
  }
  
  return false;
}

export function toggleFavorite(movie) {
  if (!movie || !movie.id) {
    console.error('Película inválida para toggle favoritos');
    return false;
  }

  if (isFavorite(movie.id)) {
    return removeFromFavorites(movie.id);
  } else {
    return addToFavorites(movie);
  }
}

export function isFavorite(movieId) {
  return favoriteMovies.has(movieId);
}

export function getFavoriteMovie(movieId) {
  return favoriteMovies.get(movieId);
}

export function getAllFavorites() {
  return Array.from(favoriteMovies.values());
}

export function getFavoritesCount() {
  return favoriteMovies.size;
}

/* ═══════════════════════════════════════════════════════════════════════
   3. FILTRADO Y ORDENAMIENTO
   ═══════════════════════════════════════════════════════════════════════ */

export function getFavoritesByGenre(genreId) {
  return getAllFavorites().filter(movie => 
    movie.genre_ids && movie.genre_ids.includes(genreId)
  );
}

export function getFavoritesSortedBy(sortBy = 'added_date', order = 'desc') {
  const favorites = getAllFavorites();
  
  return favorites.sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'title':
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
        break;
      case 'rating':
        valueA = a.vote_average || 0;
        valueB = b.vote_average || 0;
        break;
      case 'release_date':
        valueA = new Date(a.release_date || '1900-01-01');
        valueB = new Date(b.release_date || '1900-01-01');
        break;
      case 'popularity':
        valueA = a.popularity || 0;
        valueB = b.popularity || 0;
        break;
      case 'added_date':
      default:
        valueA = a.added_to_favorites_at || 0;
        valueB = b.added_to_favorites_at || 0;
        break;
    }
    
    if (order === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
}

export function searchFavorites(query) {
  if (!query || query.length < 2) {
    return getAllFavorites();
  }
  
  const searchTerm = query.toLowerCase();
  return getAllFavorites().filter(movie =>
    movie.title.toLowerCase().includes(searchTerm) ||
    movie.original_title.toLowerCase().includes(searchTerm) ||
    (movie.overview && movie.overview.toLowerCase().includes(searchTerm))
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   4. ACTUALIZACIÓN DE UI
   ═══════════════════════════════════════════════════════════════════════ */

function updateFavoritesCounter() {
  const counter = document.querySelector('.favorites-counter');
  const count = getFavoritesCount();
  
  if (counter) {
    counter.textContent = count;
    counter.classList.toggle('has-favorites', count > 0);
  }
}

function updateFavoriteButtonsUI(movieId, isFavorited) {
  const buttons = document.querySelectorAll(`[data-movie-id="${movieId}"] .favorite-btn`);
  buttons.forEach(button => {
    const icon = button.querySelector('i');
    if (icon) {
      icon.className = isFavorited ? 'fas fa-heart' : 'far fa-heart';
    }
    button.classList.toggle('favorite-btn--active', isFavorited);
    button.setAttribute('aria-pressed', isFavorited);
    button.title = isFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos';
  });
}

function showFavoriteNotification(movieTitle, added) {
  const notification = document.createElement('div');
  notification.className = 'favorite-notification';
  notification.innerHTML = `
    <div class="favorite-notification__content">
      <i class="fas fa-heart"></i>
      <span>${added ? 'Agregado a' : 'Removido de'} favoritos</span>
      <strong>${movieTitle}</strong>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Mostrar notificación
  setTimeout(() => notification.classList.add('favorite-notification--show'), 100);
  
  // Ocultar notificación después de 3 segundos
  setTimeout(() => {
    notification.classList.remove('favorite-notification--show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/* ═══════════════════════════════════════════════════════════════════════
   5. UTILIDADES Y EXPORTACIÓN
   ═══════════════════════════════════════════════════════════════════════ */

export function exportFavorites() {
  const favorites = getAllFavorites();
  const dataStr = JSON.stringify(favorites, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `cineXpress_favorites_${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

export function importFavorites(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedFavorites = JSON.parse(e.target.result);
        if (Array.isArray(importedFavorites)) {
          // Agregar películas importadas
          importedFavorites.forEach(movie => {
            if (movie.id && movie.title) {
              favoriteMovies.set(movie.id, {
                ...movie,
                added_to_favorites_at: movie.added_to_favorites_at || Date.now()
              });
            }
          });
          
          saveFavoritesToStorage();
          updateFavoritesCounter();
          resolve(importedFavorites.length);
        } else {
          reject(new Error('Formato de archivo inválido'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
}

export function clearAllFavorites() {
  if (confirm('¿Estás seguro de que quieres eliminar todos los favoritos? Esta acción no se puede deshacer.')) {
    favoriteMovies.clear();
    saveFavoritesToStorage();
    updateFavoritesCounter();
    
    // Actualizar UI de todos los botones de favoritos
    document.querySelectorAll('.favorite-btn').forEach(button => {
      const icon = button.querySelector('i');
      if (icon) {
        icon.className = 'far fa-heart';
      }
      button.classList.remove('favorite-btn--active');
      button.setAttribute('aria-pressed', 'false');
      button.title = 'Agregar a favoritos';
    });
    
    return true;
  }
  return false;
}

/* ═══════════════════════════════════════════════════════════════════════
   6. EVENTOS Y LISTENERS
   ═══════════════════════════════════════════════════════════════════════ */

export function setupFavoriteEventListeners() {
  // Event delegation para botones de favoritos
  document.addEventListener('click', function(event) {
    const favoriteBtn = event.target.closest('.favorite-btn');
    if (favoriteBtn) {
      event.preventDefault();
      event.stopPropagation();
      
      const movieCard = favoriteBtn.closest('[data-movie-id]');
      if (movieCard) {
        const movieId = parseInt(movieCard.dataset.movieId);
        const movieData = getMovieDataFromCard(movieCard);
        
        if (movieData) {
          toggleFavorite(movieData);
        }
      }
    }
  });
  
}

function getMovieDataFromCard(movieCard) {
  try {
    return {
      id: parseInt(movieCard.dataset.movieId),
      title: movieCard.dataset.movieTitle || '',
      original_title: movieCard.dataset.movieOriginalTitle || '',
      poster_path: movieCard.dataset.moviePoster || '',
      backdrop_path: movieCard.dataset.movieBackdrop || '',
      overview: movieCard.dataset.movieOverview || '',
      release_date: movieCard.dataset.movieReleaseDate || '',
      vote_average: parseFloat(movieCard.dataset.movieRating) || 0,
      vote_count: parseInt(movieCard.dataset.movieVoteCount) || 0,
      genre_ids: movieCard.dataset.movieGenres ? movieCard.dataset.movieGenres.split(',').map(id => parseInt(id)) : [],
      popularity: parseFloat(movieCard.dataset.moviePopularity) || 0,
      adult: movieCard.dataset.movieAdult === 'true',
      original_language: movieCard.dataset.movieLanguage || ''
    };
  } catch (error) {
    console.error('Error extrayendo datos de película de la tarjeta:', error);
    return null;
  }
}