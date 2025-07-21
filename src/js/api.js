/* ======================================================================
   src/js/api.js           —  VERSIÓN COMPATIBLE CON TODOS LOS NAVEGADORES
   • Usa Axios global cargado desde CDN (no usa import)
   • Compatible con iPhone 7 / iOS antiguos
   ====================================================================== */

import { API_KEY, BASE_URL, IMG_BASE_URL, DEFAULT_LANGUAGE } from './config.js';

/* Axios global (desde CDN clásico) */
const api = window.axios.create({
  baseURL : BASE_URL,
  headers : { 'Content-Type':'application/json;charset=utf-8', 'Cache-Control':'no-cache' },
  params  : { api_key: API_KEY, language: DEFAULT_LANGUAGE },
  timeout : 10000,
});

/* ────────────────────────────────────────────────────────────
   1.  TENDENCIAS Y PELÍCULAS NUEVAS
   ──────────────────────────────────────────────────────────── */
export async function getTrendingMovies (timeWindow = 'day', page = 1) {
  const { data } = await api(`trending/movie/${timeWindow}`, { params:{ page } });
  return normaliseListResponse(data);
}

// Función DEFINITIVA para obtener películas nuevas con ordenamiento PERFECTO
export async function getNewMovies(page = 1) {
  const currentYear = new Date().getFullYear();
  const resultsPerPage = 20;
  
  // Sistema dinámico: siempre los últimos 2 años + año actual + próximo año
  const startDate = `${currentYear - 1}-01-01`; 
  const endDate = `${currentYear + 1}-12-31`;
  
  try {
    // Estrategia: Pedir las primeras 3 páginas para obtener un pool grande de películas
    const pagesToFetch = Math.min(3, page === 1 ? 3 : page + 1);
    const requests = [];
    
    for (let i = 1; i <= pagesToFetch; i++) {
      requests.push(
        api('discover/movie', {
          params: {
            page: i,
            'primary_release_date.gte': startDate,
            'primary_release_date.lte': endDate,
            'sort_by': 'release_date.desc', // Simplificar el sort_by
            'vote_count.gte': 3, // Muy bajo para capturar todo
            'include_adult': false,
            'include_video': false,
            'language': 'es-ES'
          }
        })
      );
    }
    
    const responses = await Promise.all(requests);
    
    // Combinar todas las películas
    let allMovies = [];
    let totalPages = 1;
    let totalResults = 0;
    
    responses.forEach(response => {
      const data = response.data;
      allMovies = allMovies.concat(data.results || []);
      totalPages = Math.max(totalPages, data.total_pages || 1);
      totalResults = Math.max(totalResults, data.total_results || 0);
    });
    
    // Eliminar duplicados por ID
    const uniqueMovies = allMovies.filter((movie, index, self) => 
      index === self.findIndex(m => m.id === movie.id)
    );
    
    // ORDENAMIENTO ULTRA ESTRICTO POR FECHA
    const sortedMovies = uniqueMovies.sort((a, b) => {
      const dateA = new Date(a.release_date || '1900-01-01');
      const dateB = new Date(b.release_date || '1900-01-01');
      
      // Ordenar por fecha (más reciente primero)
      if (dateB.getTime() !== dateA.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      
      // Criterio secundario: popularidad
      return (b.popularity || 0) - (a.popularity || 0);
    });
    
    // Paginación manual
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const paginatedMovies = sortedMovies.slice(startIndex, endIndex);
    
    // Calcular páginas totales basado en nuestros resultados ordenados
    const calculatedTotalPages = Math.ceil(sortedMovies.length / resultsPerPage);
    
    // DEBUG: Mostrar ordenamiento
    console.log(`🎬 Página ${page} - Películas ordenadas por fecha (más reciente primero):`);
    paginatedMovies.slice(0, 5).forEach((movie, index) => {
      console.log(`${startIndex + index + 1}. ${movie.title} - ${movie.release_date}`);
    });
    console.log(`📅 Filtro: ${startDate} a ${endDate} | Total: ${sortedMovies.length} películas | Páginas: ${calculatedTotalPages}`);
    
    return {
      page,
      results: paginatedMovies,
      total_pages: calculatedTotalPages,
      total_results: sortedMovies.length
    };
    
  } catch (error) {
    console.error('Error obteniendo películas nuevas:', error);
    return {
      page,
      results: [],
      total_pages: 1,
      total_results: 0
    };
  }
}

// Función para obtener películas por año específico
export async function getMoviesByYear(year, page = 1) {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  
  try {
    const { data } = await api('discover/movie', {
      params: {
        page,
        'primary_release_date.gte': startDate,
        'primary_release_date.lte': endDate,
        'sort_by': 'release_date.desc,popularity.desc',
        'vote_count.gte': 3,
        'include_adult': false,
        'include_video': false,
        'language': 'es-ES'
      }
    });
    
    return normaliseListResponse(data);
  } catch (error) {
    console.error(`Error obteniendo películas de ${year}:`, error);
    return {
      page,
      results: [],
      total_pages: 1,
      total_results: 0
    };
  }
}

// Función para obtener conteo de películas por años (para mostrar en botones)
export async function getYearsWithMovieCounts() {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  // Generar años desde currentYear hacia atrás hasta 2000
  for (let year = currentYear; year >= 2000; year--) {
    years.push(year);
  }
  
  try {
    // Obtener conteos para los primeros 8 años (los más relevantes)
    const yearPromises = years.slice(0, 8).map(async (year) => {
      try {
        const data = await getMoviesByYear(year, 1);
        return {
          year,
          count: data.total_results || 0,
          hasMovies: (data.total_results || 0) > 0
        };
      } catch (error) {
        return {
          year,
          count: 0,
          hasMovies: false
        };
      }
    });
    
    const yearCounts = await Promise.all(yearPromises);
    
    // Filtrar solo años con películas y ordenar por año descendente
    return yearCounts
      .filter(item => item.hasMovies && item.count > 10) // Solo años con suficientes películas
      .sort((a, b) => b.year - a.year);
      
  } catch (error) {
    console.error('Error obteniendo conteos por años:', error);
    // Fallback: retornar años básicos sin conteo
    return years.slice(0, 6).map(year => ({
      year,
      count: 0,
      hasMovies: true
    }));
  }
}

/* ────────────────────────────────────────────────────────────
   2.  CATEGORÍAS
   ──────────────────────────────────────────────────────────── */
export async function getCategories () {
  const { data } = await api('genre/movie/list');
  return data.genres ?? [];
}

/* ────────────────────────────────────────────────────────────
   3.  PELÍCULAS POR CATEGORÍA
   ──────────────────────────────────────────────────────────── */
export async function getMoviesByCategory (categoryId, page = 1) {
  const { data } = await api('discover/movie', {
    params: { with_genres: categoryId, page },
  });
  return normaliseListResponse(data);
}

/* ────────────────────────────────────────────────────────────
   4.  BÚSQUEDA
   ──────────────────────────────────────────────────────────── */
export async function searchMovies (query, page = 1) {
  const { data } = await api('search/movie', {
    params: { query, page, include_adult: false },
  });
  return normaliseListResponse(data);
}

/* ────────────────────────────────────────────────────────────
   5.  DETALLE COMPLETO
   ──────────────────────────────────────────────────────────── */
export async function getMovieDetails (movieId) {
  const [movie, videos, credits, similar, keywords, reviews, images, recommendations] = await Promise.all([
    api(`movie/${movieId}`),
    api(`movie/${movieId}/videos`),
    api(`movie/${movieId}/credits`),
    api(`movie/${movieId}/similar`, { params: { page: 1 } }),
    api(`movie/${movieId}/keywords`),
    api(`movie/${movieId}/reviews`, { params: { page: 1 } }),
    api(`movie/${movieId}/images`),
    api(`movie/${movieId}/recommendations`, { params: { page: 1 } }),
  ]);

  // Filtrado estricto de películas similares
  const filteredSimilar = (similar.data.results ?? [])
    .filter(movie => {
      // Validaciones estrictas para películas similares
      return movie.id !== parseInt(movieId) && // No incluir la misma película
             movie.poster_path &&              // Debe tener poster
             movie.release_date &&             // Debe tener fecha de lanzamiento
             movie.vote_average > 0 &&         // Debe tener rating
             movie.overview &&                 // Debe tener sinopsis
             movie.title;                      // Debe tener título
    })
    .slice(0, 12); // Aumentar a 12 para tener más opciones después del filtro

  // Procesar datos adicionales
  const movieData = movie.data;
  const crew = credits.data.crew ?? [];
  
  return {
    ...movieData,
    videos : videos.data.results ?? [],
    cast   : credits.data.cast?.slice(0, 15) ?? [], // Aumentar reparto a 15
    crew   : crew,
    director: crew.find(person => person.job === 'Director')?.name || 'No disponible',
    producers: crew.filter(person => person.job === 'Producer').map(p => p.name).slice(0, 3),
    writers: crew.filter(person => person.job === 'Writer' || person.job === 'Screenplay').map(p => p.name).slice(0, 3),
    cinematographer: crew.find(person => person.job === 'Director of Photography')?.name || null,
    musicComposer: crew.find(person => person.job === 'Original Music Composer')?.name || null,
    similar: filteredSimilar,
    keywords: keywords.data.keywords?.slice(0, 10) ?? [],
    reviews: reviews.data.results?.slice(0, 3) ?? [],
    backdrops: images.data.backdrops?.slice(0, 8) ?? [],
    posters: images.data.posters?.slice(0, 6) ?? [],
    recommendations: recommendations.data.results?.slice(0, 6) ?? [],
    // Información financiera y técnica
    budget: movieData.budget || 0,
    revenue: movieData.revenue || 0,
    profit: (movieData.revenue || 0) - (movieData.budget || 0),
    originalLanguage: movieData.original_language || 'N/A',
    spokenLanguages: movieData.spoken_languages?.map(lang => lang.english_name) ?? [],
    productionCountries: movieData.production_countries?.map(country => country.name) ?? [],
    productionCompanies: movieData.production_companies?.slice(0, 5) ?? [],
    status: movieData.status || 'N/A',
    tagline: movieData.tagline || null,
    homepage: movieData.homepage || null,
    imdbId: movieData.imdb_id || null,
    popularity: movieData.popularity || 0,
    voteCount: movieData.vote_count || 0,
    adult: movieData.adult || false,
    releaseDate: movieData.release_date || null,
    originalTitle: movieData.original_title || movieData.title,
  };
}

/* ────────────────────────────────────────────────────────────
   6.  RECOMENDACIONES INTELIGENTES PARA PELÍCULAS SIMILARES
   ──────────────────────────────────────────────────────────── */
export async function getRecommendationsForMovie(movieId, movieGenres, page = 1) {
  try {
    // Obtener el primer género de la película para buscar similares
    const primaryGenre = movieGenres && movieGenres.length > 0 ? movieGenres[0].id : null;
    
    if (primaryGenre) {
      // Buscar películas del mismo género
      const { data } = await api('discover/movie', {
        params: { 
          with_genres: primaryGenre,
          page: page,
          sort_by: 'vote_average.desc',
          'vote_count.gte': 100 // Solo películas con suficientes votos
        },
      });
      
      return normaliseListResponse(data);
    } else {
      // Fallback a películas trending si no hay géneros
      return await getTrendingMovies('week', page);
    }
  } catch (error) {
    console.warn('Error obteniendo recomendaciones:', error);
    return { results: [], total_pages: 0, page: 1, total_results: 0 };
  }
}

/* ────────────────────────────────────────────────────────────
   7.  SAGAS Y COLECCIONES
   ──────────────────────────────────────────────────────────── */
export async function getCollectionDetails(collectionId) {
  try {
    const { data } = await api(`collection/${collectionId}`);
    return data;
  } catch (error) {
    console.error('Error obteniendo detalles de colección:', error);
    return null;
  }
}

export async function getPopularSagas() {
  // Definir sagas populares conocidas con sus IDs de colección correctos
  const popularSagas = [
    // Sagas principales actuales
    { id: 2344, name: 'Matrix', searchTerm: 'matrix' },
    { id: 9485, name: 'Rápido y Furioso', searchTerm: 'fast furious' },
    { id: 99901, name: 'Soldado Universal', searchTerm: 'universal soldier' },
    { id: 99902, name: 'Universo DC', searchTerm: 'batman superman wonder woman' },
    { id: 99903, name: 'Universo Marvel', searchTerm: 'avengers iron man thor captain america hulk black panther spider-man doctor strange guardians galaxy ant-man captain marvel black widow deadpool wolverine venom fantastic four x-men' },
    { id: 645, name: 'James Bond', searchTerm: 'james bond' },
    { id: 528, name: 'Terminator', searchTerm: 'terminator' },
    { id: 328, name: 'Jurassic Park', searchTerm: 'jurassic' },
    { id: 295, name: 'Pirates of the Caribbean', searchTerm: 'pirates caribbean' },
    { id: 8650, name: 'Transformers', searchTerm: 'transformers' },
    { id: 86311, name: 'Avengers', searchTerm: 'avengers' },
    { id: 10, name: 'Star Wars', searchTerm: 'star wars' },
    { id: 1241, name: 'Harry Potter', searchTerm: 'harry potter' },
    { id: 119, name: 'El Señor de los Anillos', searchTerm: 'lord rings' },
    { id: 8091, name: 'Alien', searchTerm: 'alien' },
    { id: 91361, name: 'Halloween', searchTerm: 'halloween' },
    { id: 2602, name: 'Scream', searchTerm: 'scream' },
    { id: 748, name: 'X-Men', searchTerm: 'x-men' },
    { id: 404609, name: 'John Wick', searchTerm: 'john wick' },
    { id: 304, name: 'Ocean\'s', searchTerm: 'ocean eleven twelve thirteen' },
    
    // Nuevas sagas de terror y suspenso
    { id: 1709, name: 'Saw', searchTerm: 'saw' },
    { id: 99950, name: 'Conjuring', searchTerm: 'conjuring' },
    { id: 99951, name: 'Insidious', searchTerm: 'insidious' },
    { id: 99952, name: 'Purge', searchTerm: 'purge' },
    { id: 99953, name: 'Final Destination', searchTerm: 'final destination' },
    { id: 99954, name: 'Paranormal Activity', searchTerm: 'paranormal activity' },
    { id: 99955, name: 'Nightmare on Elm Street', searchTerm: 'nightmare elm street' },
    { id: 99956, name: 'Friday the 13th', searchTerm: 'friday 13th' },
    { id: 99957, name: 'Child\'s Play', searchTerm: 'child play chucky' },
    { id: 99958, name: 'Annabelle', searchTerm: 'annabelle' },
    
    // Sagas de acción y aventura
    { id: 99960, name: 'Mission Impossible', searchTerm: 'mission impossible' },
    { id: 99961, name: 'Bourne', searchTerm: 'bourne' },
    { id: 99962, name: 'Die Hard', searchTerm: 'die hard' },
    { id: 99963, name: 'Lethal Weapon', searchTerm: 'lethal weapon' },
    { id: 99964, name: 'Mad Max', searchTerm: 'mad max' },
    { id: 99965, name: 'Rambo', searchTerm: 'rambo' },
    { id: 99966, name: 'Rocky', searchTerm: 'rocky' },
    { id: 99967, name: 'Expendables', searchTerm: 'expendables' },
    { id: 99968, name: 'Taken', searchTerm: 'taken' },
    { id: 99969, name: 'Bad Boys', searchTerm: 'bad boys' },
    
    // Sagas de ciencia ficción
    { id: 99970, name: 'Blade Runner', searchTerm: 'blade runner' },
    { id: 99971, name: 'Predator', searchTerm: 'predator' },
    { id: 99972, name: 'RoboCop', searchTerm: 'robocop' },
    { id: 99973, name: 'Back to the Future', searchTerm: 'back future' },
    { id: 99974, name: 'Planet of the Apes', searchTerm: 'planet apes' },
    { id: 99975, name: 'Men in Black', searchTerm: 'men black' },
    { id: 99976, name: 'Independence Day', searchTerm: 'independence day' },
    { id: 99977, name: 'Godzilla', searchTerm: 'godzilla' },
    { id: 99978, name: 'King Kong', searchTerm: 'king kong' },
    { id: 99979, name: 'Pacific Rim', searchTerm: 'pacific rim' },
    
    // Sagas de fantasía y aventura
    { id: 99980, name: 'El Hobbit', searchTerm: 'hobbit' },
    { id: 99981, name: 'Chronicles of Narnia', searchTerm: 'narnia' },
    { id: 99982, name: 'Underworld', searchTerm: 'underworld' },
    { id: 99983, name: 'Resident Evil', searchTerm: 'resident evil' },
    { id: 99984, name: 'Mummy', searchTerm: 'mummy' },
    { id: 99985, name: 'Indiana Jones', searchTerm: 'indiana jones' },
    { id: 99986, name: 'Shrek', searchTerm: 'shrek' },
    { id: 99987, name: 'Ice Age', searchTerm: 'ice age' },
    { id: 99988, name: 'Madagascar', searchTerm: 'madagascar' },
    { id: 99989, name: 'Toy Story', searchTerm: 'toy story' },
    
    // Sagas de comedia y familia
    { id: 99990, name: 'American Pie', searchTerm: 'american pie' },
    { id: 99991, name: 'Hangover', searchTerm: 'hangover' },
    { id: 99992, name: 'Meet the Parents', searchTerm: 'meet parents' },
    { id: 99993, name: 'Rush Hour', searchTerm: 'rush hour' },
    { id: 99994, name: 'Austin Powers', searchTerm: 'austin powers' },
    { id: 99995, name: 'Scary Movie', searchTerm: 'scary movie' },
    { id: 99996, name: 'Despicable Me', searchTerm: 'despicable me' },
    { id: 99997, name: 'Cars', searchTerm: 'cars' },
    { id: 99998, name: 'Finding Nemo', searchTerm: 'finding nemo dory' },
    { id: 99999, name: 'Incredibles', searchTerm: 'incredibles' },
    
    // Sagas de drama y crimen
    { id: 100000, name: 'Godfather', searchTerm: 'godfather' },
    { id: 100001, name: 'Silence of the Lambs', searchTerm: 'silence lambs hannibal' },
    { id: 100002, name: 'Dirty Harry', searchTerm: 'dirty harry' },
    { id: 100003, name: 'Scarface', searchTerm: 'scarface' },
    { id: 100004, name: 'Goodfellas', searchTerm: 'goodfellas' },
    { id: 100005, name: 'Casino', searchTerm: 'casino' },
    { id: 100006, name: 'Fast Times', searchTerm: 'fast times' },
    { id: 100007, name: 'Police Academy', searchTerm: 'police academy' },
    { id: 100008, name: 'Naked Gun', searchTerm: 'naked gun' },
    { id: 100009, name: 'Pink Panther', searchTerm: 'pink panther' },
    
    // Sagas de acción asiática
    { id: 100010, name: 'Karate Kid', searchTerm: 'karate kid' },
    { id: 100011, name: 'Kill Bill', searchTerm: 'kill bill' },
    { id: 100012, name: 'Ip Man', searchTerm: 'ip man' },
    { id: 100013, name: 'The Raid', searchTerm: 'raid' },
    { id: 100014, name: 'Ong Bak', searchTerm: 'ong bak' },
    { id: 100015, name: 'Enter the Dragon', searchTerm: 'enter dragon' },
    { id: 100016, name: 'Jackie Chan Adventures', searchTerm: 'jackie chan' },
    { id: 100017, name: 'Jet Li Films', searchTerm: 'jet li' },
    { id: 100018, name: 'Crouching Tiger', searchTerm: 'crouching tiger' },
    { id: 100019, name: 'House of Flying Daggers', searchTerm: 'house flying daggers' },
    
    // Sagas de western
    { id: 100020, name: 'Sergio Leone Westerns', searchTerm: 'good bad ugly' },
    { id: 100021, name: 'Django', searchTerm: 'django' },
    { id: 100022, name: 'Magnificent Seven', searchTerm: 'magnificent seven' },
    { id: 100023, name: 'Young Guns', searchTerm: 'young guns' },
    { id: 100024, name: 'Tombstone', searchTerm: 'tombstone' },
    { id: 100025, name: '3:10 to Yuma', searchTerm: 'yuma' },
    { id: 100026, name: 'Unforgiven', searchTerm: 'unforgiven' },
    { id: 100027, name: 'The Wild Bunch', searchTerm: 'wild bunch' },
    { id: 100028, name: 'Butch Cassidy', searchTerm: 'butch cassidy' },
    { id: 100029, name: 'Dances with Wolves', searchTerm: 'dances wolves' },
    
    // Sagas de deportes
    { id: 100030, name: 'Mighty Ducks', searchTerm: 'mighty ducks' },
    { id: 100031, name: 'Coach Carter', searchTerm: 'coach carter' },
    { id: 100032, name: 'Remember the Titans', searchTerm: 'remember titans' },
    { id: 100033, name: 'Any Given Sunday', searchTerm: 'any given sunday' },
    { id: 100034, name: 'The Longest Yard', searchTerm: 'longest yard' },
    { id: 100035, name: 'Major League', searchTerm: 'major league' },
    { id: 100036, name: 'Field of Dreams', searchTerm: 'field dreams' },
    { id: 100037, name: 'Hoosiers', searchTerm: 'hoosiers' },
    { id: 100038, name: 'Rudy', searchTerm: 'rudy' },
    { id: 100039, name: 'The Waterboy', searchTerm: 'waterboy' },
    
    // Sagas de música y danza
    { id: 100040, name: 'Step Up', searchTerm: 'step up' },
    { id: 100041, name: 'High School Musical', searchTerm: 'high school musical' },
    { id: 100042, name: 'Mamma Mia', searchTerm: 'mamma mia' },
    { id: 100043, name: 'Pitch Perfect', searchTerm: 'pitch perfect' },
    { id: 100044, name: 'Hairspray', searchTerm: 'hairspray' },
    { id: 100045, name: 'La La Land', searchTerm: 'la la land' },
    { id: 100046, name: 'Chicago', searchTerm: 'chicago' },
    { id: 100047, name: 'Moulin Rouge', searchTerm: 'moulin rouge' },
    { id: 100048, name: 'Grease', searchTerm: 'grease' },
    { id: 100049, name: 'West Side Story', searchTerm: 'west side story' },
    
    // Sagas de road trip y aventura
    { id: 100050, name: 'National Lampoon Vacation', searchTerm: 'national lampoon vacation' },
    { id: 100051, name: 'Dumb and Dumber', searchTerm: 'dumb dumber' },
    { id: 100052, name: 'Harold and Kumar', searchTerm: 'harold kumar' },
    { id: 100053, name: 'Cheech and Chong', searchTerm: 'cheech chong' },
    { id: 100054, name: 'Wayne\'s World', searchTerm: 'wayne world' },
    { id: 100055, name: 'Bill and Ted', searchTerm: 'bill ted' },
    { id: 100056, name: 'Pineapple Express', searchTerm: 'pineapple express' },
    { id: 100057, name: 'This Is the End', searchTerm: 'this is the end' },
    { id: 100058, name: 'Superbad', searchTerm: 'superbad' },
    { id: 100059, name: 'Pineapple Express', searchTerm: 'pineapple express' },
    
    // Sagas de supervivencia y desastres
    { id: 100060, name: 'The Poseidon Adventure', searchTerm: 'poseidon adventure' },
    { id: 100061, name: 'Towering Inferno', searchTerm: 'towering inferno' },
    { id: 100062, name: 'Earthquake', searchTerm: 'earthquake' },
    { id: 100063, name: 'Volcano', searchTerm: 'volcano' },
    { id: 100064, name: 'Twister', searchTerm: 'twister' },
    { id: 100065, name: 'The Perfect Storm', searchTerm: 'perfect storm' },
    { id: 100066, name: 'Into the Wild', searchTerm: 'into wild' },
    { id: 100067, name: 'Cast Away', searchTerm: 'cast away' },
    { id: 100068, name: 'Life of Pi', searchTerm: 'life pi' },
    { id: 100069, name: 'Gravity', searchTerm: 'gravity' },
    
    // Sagas de crímenes y heist
    { id: 100070, name: 'Heat', searchTerm: 'heat' },
    { id: 100071, name: 'The Town', searchTerm: 'town' },
    { id: 100072, name: 'Gone in 60 Seconds', searchTerm: 'gone 60 seconds' },
    { id: 100073, name: 'The Italian Job', searchTerm: 'italian job' },
    { id: 100074, name: 'Now You See Me', searchTerm: 'now you see me' },
    { id: 100075, name: 'Baby Driver', searchTerm: 'baby driver' },
    { id: 100076, name: 'Point Break', searchTerm: 'point break' },
    { id: 100077, name: 'The Bank Job', searchTerm: 'bank job' },
    { id: 100078, name: 'Inside Man', searchTerm: 'inside man' },
    { id: 100079, name: 'Reservoir Dogs', searchTerm: 'reservoir dogs' },
    
    // Sagas de espionaje y thriller
    { id: 100080, name: 'The Spy Who Loved Me', searchTerm: 'spy who loved me' },
    { id: 100081, name: 'Tinker Tailor Soldier Spy', searchTerm: 'tinker tailor soldier spy' },
    { id: 100082, name: 'The Manchurian Candidate', searchTerm: 'manchurian candidate' },
    { id: 100083, name: 'Three Days of the Condor', searchTerm: 'three days condor' },
    { id: 100084, name: 'North by Northwest', searchTerm: 'north northwest' },
    { id: 100085, name: 'The Fugitive', searchTerm: 'fugitive' },
    { id: 100086, name: 'Enemy of the State', searchTerm: 'enemy state' },
    { id: 100087, name: 'Salt', searchTerm: 'salt' },
    { id: 100088, name: 'Safe House', searchTerm: 'safe house' },
    { id: 100089, name: 'The Recruit', searchTerm: 'recruit' },
    
    // Sagas de misterio y detective
    { id: 100090, name: 'Sherlock Holmes', searchTerm: 'sherlock holmes' },
    { id: 100091, name: 'The Maltese Falcon', searchTerm: 'maltese falcon' },
    { id: 100092, name: 'The Big Sleep', searchTerm: 'big sleep' },
    { id: 100093, name: 'Chinatown', searchTerm: 'chinatown' },
    { id: 100094, name: 'The Long Goodbye', searchTerm: 'long goodbye' },
    { id: 100095, name: 'L.A. Confidential', searchTerm: 'la confidential' },
    { id: 100096, name: 'Zodiac', searchTerm: 'zodiac' },
    { id: 100097, name: 'Se7en', searchTerm: 'se7en' },
    { id: 100098, name: 'The Prestige', searchTerm: 'prestige' },
    { id: 100099, name: 'Shutter Island', searchTerm: 'shutter island' }
  ];

  return popularSagas;
}

export async function getSagaMovies(sagaData) {
  try {
      
    // Para Matrix, hacer búsqueda directa y filtrar SOLO Matrix
    if (sagaData.name === 'Matrix') {
      
      const searchResults = await searchMovies('matrix', 1);
      
      
      const matrixMovies = searchResults.results.filter(movie => {
        const title = movie.title.toLowerCase();
        const originalTitle = movie.original_title?.toLowerCase() || '';
        
        // Solo películas que contengan exactamente "matrix"
        const isMatrix = title.includes('matrix') || originalTitle.includes('matrix');
        
        // Excluir documentales y otras películas no relacionadas
        const isNotDocumentary = !title.includes('documentary') && !title.includes('making of');
        
        
        
        return isMatrix && isNotDocumentary;
      });
      
      
      
      return {
        ...sagaData,
        movies: orderByReleaseDate(matrixMovies),
        backdrop_path: matrixMovies[0]?.backdrop_path,
        poster_path: matrixMovies[0]?.poster_path,
        overview: 'La trilogía Matrix y sus secuelas'
      };
    }
    
    // Búsqueda optimizada para Universo Marvel
    if (sagaData.name === 'Universo Marvel') {
      
      
      // Hacer solo 2 búsquedas principales para no sobrecargar
      const searchPromises = [
        searchMovies('avengers', 1),
        searchMovies('marvel', 1)
      ];
      
      const searchResults = await Promise.all(searchPromises);
      const allMovies = [];
      
      // Términos Marvel para filtrar
      const marvelTerms = ['avengers', 'iron man', 'thor', 'captain america', 'hulk', 'black panther', 'spider-man', 'doctor strange', 'guardians galaxy', 'ant-man', 'captain marvel', 'black widow', 'deadpool', 'wolverine', 'venom', 'fantastic four', 'x-men', 'marvel'];
      
      searchResults.forEach(result => {
        const filteredMovies = result.results.filter(movie => {
          const title = movie.title.toLowerCase();
          const originalTitle = movie.original_title?.toLowerCase() || '';
          
          // Filtrar por relevancia Marvel
          const isMarvelRelated = marvelTerms.some(marvelTerm => 
            title.includes(marvelTerm) || originalTitle.includes(marvelTerm)
          );
          const isNotDocumentary = !title.includes('documentary') && 
                                  !title.includes('making of') && 
                                  !title.includes('behind the scenes');
          
          return isMarvelRelated && isNotDocumentary && movie.vote_average > 0;
        });
        
        allMovies.push(...filteredMovies);
      });
      
      // Eliminar duplicados basándose en el ID
      const uniqueMovies = allMovies.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      );
      
      // Ordenar por popularidad y fecha
      const sortedMovies = uniqueMovies.sort((a, b) => {
        const popularityDiff = b.popularity - a.popularity;
        if (Math.abs(popularityDiff) > 10) return popularityDiff;
        return (b.release_date || '').localeCompare(a.release_date || '');
      });
      
      return {
        ...sagaData,
        movies: sortedMovies.slice(0, 25), // Más películas para Marvel
        backdrop_path: sortedMovies[0]?.backdrop_path,
        poster_path: sortedMovies[0]?.poster_path,
        overview: 'Películas del Universo Marvel incluyendo Capitán América, Hulk, Pantera Negra, Iron Man, Thor, Spider-Man, Doctor Strange, Guardianes de la Galaxia, Ant-Man, Capitana Marvel, Viuda Negra, Deadpool, Wolverine, Venom, Fantastic Four, X-Men y más'
      };
    }
    
    // Búsqueda optimizada para Universo DC
    if (sagaData.name === 'Universo DC') {
      
      
      // Hacer búsquedas principales para DC
      const searchPromises = [
        searchMovies('batman', 1),
        searchMovies('superman', 1),
        searchMovies('wonder woman', 1)
      ];
      
      const searchResults = await Promise.all(searchPromises);
      const allMovies = [];
      
      // Términos DC para filtrar
      const dcTerms = ['batman', 'superman', 'wonder woman', 'aquaman', 'flash', 'green lantern', 'justice league', 'suicide squad', 'harley quinn', 'joker', 'shazam', 'cyborg', 'green arrow', 'catwoman', 'penguin', 'riddler', 'bane', 'lex luthor'];
      
      searchResults.forEach(result => {
        const filteredMovies = result.results.filter(movie => {
          const title = movie.title.toLowerCase();
          const originalTitle = movie.original_title?.toLowerCase() || '';
          
          // Filtrar por relevancia DC
          const isDCRelated = dcTerms.some(dcTerm => 
            title.includes(dcTerm) || originalTitle.includes(dcTerm)
          );
          const isNotDocumentary = !title.includes('documentary') && 
                                  !title.includes('making of') && 
                                  !title.includes('behind the scenes');
          
          return isDCRelated && isNotDocumentary && movie.vote_average > 0;
        });
        
        allMovies.push(...filteredMovies);
      });
      
      // Eliminar duplicados basándose en el ID
      const uniqueMovies = allMovies.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      );
      
      // Ordenar por popularidad y fecha
      const sortedMovies = uniqueMovies.sort((a, b) => {
        const popularityDiff = b.popularity - a.popularity;
        if (Math.abs(popularityDiff) > 10) return popularityDiff;
        return (b.release_date || '').localeCompare(a.release_date || '');
      });
      
      return {
        ...sagaData,
        movies: sortedMovies.slice(0, 25), // Más películas para DC
        backdrop_path: sortedMovies[0]?.backdrop_path,
        poster_path: sortedMovies[0]?.poster_path,
        overview: 'Películas del Universo DC incluyendo Batman, Superman, Wonder Woman, Aquaman, Flash, Green Lantern, Liga de la Justicia, Suicide Squad, Harley Quinn, Joker, Shazam y más'
      };
    }
    
    // Para otras sagas, intentar colección primero
    if (sagaData.id && sagaData.id > 0 && sagaData.id < 99900) {
      
      const collection = await getCollectionDetails(sagaData.id);
      if (collection && collection.parts && collection.parts.length > 0) {
        
        return {
          ...sagaData,
          movies: orderByReleaseDate(collection.parts),
          backdrop_path: collection.backdrop_path,
          poster_path: collection.poster_path,
          overview: collection.overview
        };
      }
    }
    
    // Fallback: búsqueda por término con múltiples intentos
    
    
    // Buscar con términos individuales para obtener más resultados
    const searchTerms = sagaData.searchTerm.toLowerCase().split(' ');
    const allMovies = [];
    
    // Intentar búsqueda con cada término individual
    for (const term of searchTerms) {
      if (term.length > 2) { // Solo buscar términos con más de 2 caracteres
        try {
          const searchResults = await searchMovies(term, 1);
          const filteredMovies = searchResults.results.filter(movie => {
            const title = movie.title.toLowerCase();
            const originalTitle = movie.original_title?.toLowerCase() || '';
            
            // Verificar que al menos uno de los términos esté en el título
            return searchTerms.some(searchTerm => 
              title.includes(searchTerm) || originalTitle.includes(searchTerm)
            );
          });
          
          allMovies.push(...filteredMovies);
        } catch (error) {
          console.warn(`Error buscando término "${term}":`, error);
        }
      }
    }
    
    // Si no se encontraron películas, intentar con términos más generales
    if (allMovies.length === 0) {
      
      const fallbackTerm = getFallbackSearchTerm(sagaData.name);
      if (fallbackTerm) {
        try {
          const searchResults = await searchMovies(fallbackTerm, 1);
          allMovies.push(...searchResults.results.slice(0, 10));
        } catch (error) {
          console.warn(`Error en búsqueda fallback:`, error);
        }
      }
    }
    
    // Eliminar duplicados basándose en el ID
    const uniqueMovies = allMovies.filter((movie, index, self) => 
      index === self.findIndex(m => m.id === movie.id)
    );
    
    
    
    return {
      ...sagaData,
      movies: orderByReleaseDate(uniqueMovies.slice(0, 20)),
      backdrop_path: uniqueMovies[0]?.backdrop_path,
      poster_path: uniqueMovies[0]?.poster_path,
      overview: `Colección de películas de ${sagaData.name}`
    };
  } catch (error) {
    console.error('Error obteniendo películas de saga:', error);
    return {
      ...sagaData,
      movies: [],
      backdrop_path: null,
      poster_path: null,
      overview: `Error cargando películas de ${sagaData.name}`
    };
  }
}

// Función para obtener términos de búsqueda fallback más generales
function getFallbackSearchTerm(sagaName) {
  const fallbackTerms = {
    // Acción asiática
    'Ip Man': 'martial arts',
    'Ong Bak': 'martial arts',
    'Jackie Chan Adventures': 'action comedy',
    'Jet Li Films': 'martial arts',
    'House of Flying Daggers': 'chinese film',
    'Sergio Leone Westerns': 'western',
    
    // Western
    'Tombstone': 'western',
    '3:10 to Yuma': 'western',
    'Unforgiven': 'western',
    'The Wild Bunch': 'western',
    'Dances with Wolves': 'western',
    
    // Espionaje
    'Tinker Tailor Soldier Spy': 'spy',
    'The Manchurian Candidate': 'thriller',
    'Three Days of the Condor': 'thriller',
    'The Fugitive': 'thriller',
    'Enemy of the State': 'thriller',
    'Salt': 'action',
    'Safe House': 'action',
    'The Recruit': 'thriller',
    
    // Términos generales por género
    'Step Up': 'dance',
    'High School Musical': 'musical',
    'Mamma Mia': 'musical',
    'Pitch Perfect': 'musical comedy',
    'Hairspray': 'musical',
    'La La Land': 'musical',
    'Chicago': 'musical',
    'Moulin Rouge': 'musical',
    'Grease': 'musical',
    'West Side Story': 'musical'
  };
  
  return fallbackTerms[sagaName] || null;
}

function orderByReleaseDate(movies) {
  return [...movies].sort((a, b) => {
    const dateA = a.release_date || '1900-01-01';
    const dateB = b.release_date || '1900-01-01';
    return dateB.localeCompare(dateA); // Orden descendente (más nueva primero)
  });
}

/* ────────────────────────────────────────────────────────────
   8.  UTILIDAD DE IMAGEN
   ──────────────────────────────────────────────────────────── */
export function getFullImageUrl (path, size = 'w300') {
  return path ? `${IMG_BASE_URL}${size}${path}` : './src/img/no-image.jpg';
}

/* ────────────────────────────────────────────────────────────
   7.  HOMOGENEIZAR RESPUESTA
   ──────────────────────────────────────────────────────────── */
function normaliseListResponse (data = {}) {
  return {
    page         : data.page ?? 1,
    results      : data.results ?? [],
    total_pages  : data.total_pages ?? 1,
    total_results: data.total_results ?? data.results?.length ?? 0,
  };
}
