// ============ CONFIGURACIÓN DE AXIOS ============

// Se crea una instancia de Axios con configuración predeterminada para todas las peticiones
const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/', // URL base de TMDB
  headers: {
    'Content-Type': 'application/json;charset=utf-8', // Formato JSON
  },
  params: {
    'api_key': API_KEY, // Se añade la API Key automáticamente a cada request
  },
});


// ============ UTILIDADES ============

// Renderiza una lista de películas dentro del contenedor indicado
function createMovies(movies, container) {
  container.innerHTML = ''; // Limpia el contenedor para evitar duplicados

  movies.forEach(movie => {
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container');

    // Al hacer clic en una película, se actualiza el hash para navegar al detalle
    movieContainer.addEventListener('click', () => {
      location.hash = '#movie=' + movie.id;
    });

    const movieImg = document.createElement('img');
    movieImg.classList.add('movie-img');
    movieImg.setAttribute('alt', movie.title);
    movieImg.setAttribute(
      'src',
      'https://image.tmdb.org/t/p/w300' + movie.poster_path, // URL con tamaño 300px
    );

    movieContainer.appendChild(movieImg);
    container.appendChild(movieContainer);
  });
}

// Renderiza una lista de categorías con enlaces navegables
function createCategories(categories, container) {
  container.innerHTML = ''; // Limpia el contenedor

  categories.forEach(category => {
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('category-container');

    const categoryTitle = document.createElement('h3');
    categoryTitle.classList.add('category-title');
    categoryTitle.setAttribute('id', 'id' + category.id);

    // Al hacer clic se actualiza el hash a la categoría correspondiente
    categoryTitle.addEventListener('click', () => {
      location.hash = `#category=${category.id}-${category.name}`;
    });

    const categoryTitleText = document.createTextNode(category.name);
    categoryTitle.appendChild(categoryTitleText);
    categoryContainer.appendChild(categoryTitle);
    container.appendChild(categoryContainer);
  });
}


// ============ LLAMADAS A LA API ============

// Películas en tendencia para vista previa (home)
async function getTrendingMoviesPreview() {
  const { data } = await api('trending/movie/day');
  const movies = data.results;
  console.log(movies);

  createMovies(movies, trendingMoviesPreviewList); // Renderiza en sección de preview
}

// Categorías para vista previa (home)
async function getCategegoriesPreview() {
  const { data } = await api('genre/movie/list');
  const categories = data.genres;

  createCategories(categories, categoriesPreviewList); // Renderiza en sección de categorías
}

// Películas filtradas por categoría
async function getMoviesByCategory(id) {
  const { data } = await api('discover/movie', {
    params: {
      with_genres: id, // Parámetro para filtrar por ID de categoría
    },
  });
  const movies = data.results;

  createMovies(movies, genericSection); // Renderiza en la sección genérica
}

// Películas filtradas por búsqueda
async function getMoviesBySearch(query) {
  const { data } = await api('search/movie', {
    params: {
      query, // Texto ingresado por el usuario
    },
  });
  const movies = data.results;

  createMovies(movies, genericSection); // Muestra los resultados de la búsqueda
}

// Todas las películas en tendencia (vista completa)
async function getTrendingMovies() {
  const { data } = await api('trending/movie/day');
  const movies = data.results;

  createMovies(movies, genericSection); // Muestra en sección genérica
}

// Película individual por ID (detalle)
async function getMovieById(id) {
  const { data: movie } = await api('movie/' + id); // Petición al endpoint específico por ID

  // Imagen de fondo del header con gradiente oscuro
  const movieImgUrl = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
  console.log(movieImgUrl);

  headerSection.style.background = `
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.35) 19.27%,
      rgba(0, 0, 0, 0) 29.17%
    ),
    url(${movieImgUrl})
  `;

  // Datos de la película
  movieDetailTitle.textContent = movie.title;
  movieDetailDescription.textContent = movie.overview;
  movieDetailScore.textContent = movie.vote_average;

  // Renderiza las categorías asociadas a la película
  createCategories(movie.genres, movieDetailCategoriesList);
}
