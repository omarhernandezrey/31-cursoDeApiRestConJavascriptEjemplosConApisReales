// ============ CONFIGURACIÓN DE AXIOS ============

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/', // Base de la API TMDB
  headers: {
    'Content-Type': 'application/json;charset=utf-8', // Se usa JSON como formato
  },
  params: {
    'api_key': API_KEY, // Token de autenticación
  },
});


// ============ FUNCIONES UTILITARIAS ============

// Crea elementos visuales de películas y les asigna navegación al detalle
function createMovies(movies, container) {
  container.innerHTML = ''; // Limpia contenido anterior

  movies.forEach(movie => {
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container');
    movieContainer.addEventListener('click', () => {
      location.hash = '#movie=' + movie.id; // Al hacer clic, se navega al detalle
    });

    const movieImg = document.createElement('img');
    movieImg.classList.add('movie-img');
    movieImg.setAttribute('alt', movie.title);
    movieImg.setAttribute(
      'src',
      'https://image.tmdb.org/t/p/w300' + movie.poster_path // Carga imagen del póster
    );

    movieContainer.appendChild(movieImg);
    container.appendChild(movieContainer);
  });
}

// Crea etiquetas de categorías con navegación por hash
function createCategories(categories, container) {
  container.innerHTML = ''; // Limpia contenido anterior

  categories.forEach(category => {
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('category-container');

    const categoryTitle = document.createElement('h3');
    categoryTitle.classList.add('category-title');
    categoryTitle.setAttribute('id', 'id' + category.id);
    categoryTitle.addEventListener('click', () => {
      location.hash = `#category=${category.id}-${category.name}`; // Navega a categoría
    });

    const categoryTitleText = document.createTextNode(category.name);
    categoryTitle.appendChild(categoryTitleText);
    categoryContainer.appendChild(categoryTitle);
    container.appendChild(categoryContainer);
  });
}


// ============ FUNCIONES DE PETICIÓN A LA API ============

// Películas en tendencia (vista previa para home)
async function getTrendingMoviesPreview() {
  const { data } = await api('trending/movie/day');
  const movies = data.results;
  console.log(movies);
  createMovies(movies, trendingMoviesPreviewList);
}

// Lista de categorías (home)
async function getCategegoriesPreview() {
  const { data } = await api('genre/movie/list');
  const categories = data.genres;
  createCategories(categories, categoriesPreviewList);
}

// Películas por categoría ID
async function getMoviesByCategory(id) {
  const { data } = await api('discover/movie', {
    params: {
      with_genres: id,
    },
  });
  const movies = data.results;
  createMovies(movies, genericSection);
}

// Películas por búsqueda (query)
async function getMoviesBySearch(query) {
  const { data } = await api('search/movie', {
    params: {
      query,
    },
  });
  const movies = data.results;
  createMovies(movies, genericSection);
}

// Películas en tendencia (vista completa)
async function getTrendingMovies() {
  const { data } = await api('trending/movie/day');
  const movies = data.results;
  createMovies(movies, genericSection);
}

// ============ ENDPOINT DE DETALLES DE UNA PELÍCULA ============

async function getMovieById(id) {
  // Petición al endpoint específico con el ID de la película
  const { data: movie } = await api('movie/' + id);

  // Imagen de fondo del header (formato grande)
  const movieImgUrl = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
  console.log(movieImgUrl);

  // Se aplica el fondo con gradiente y poster
  headerSection.style.background = `
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.35) 19.27%,
      rgba(0, 0, 0, 0) 29.17%
    ),
    url(${movieImgUrl})
  `;

  // Se rellenan los textos del detalle
  movieDetailTitle.textContent = movie.title;
  movieDetailDescription.textContent = movie.overview;
  movieDetailScore.textContent = movie.vote_average;

  // Se listan los géneros como etiquetas
  createCategories(movie.genres, movieDetailCategoriesList);

  // También se obtienen películas relacionadas
  getRelatedMoviesId(id);
}

// Películas recomendadas relacionadas a la actual
async function getRelatedMoviesId(id) {
  const { data } = await api(`movie/${id}/recommendations`);
  const relatedMovies = data.results;
  createMovies(relatedMovies, relatedMoviesContainer);
}
