// ============ INSTANCIA AXIOS CONFIGURADA ============

// Se crea una instancia personalizada de Axios para acceder a la API de The Movie Database
const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/', // URL base para todos los endpoints
  headers: {
    'Content-Type': 'application/json;charset=utf-8', // Tipo de contenido esperado
  },
  params: {
    'api_key': API_KEY, // Parámetro de autenticación requerido por TMDB
  },
});


// ============ FUNCIONES UTILITARIAS ============

// Función que recibe un arreglo de películas y un contenedor HTML, limpia el contenedor y agrega las películas
function createMovies(movies, container) {
  container.innerHTML = ''; // Limpia el contenido previo del contenedor

  movies.forEach(movie => {
    const movieContainer = document.createElement('div'); // Crea contenedor de película
    movieContainer.classList.add('movie-container'); // Asigna clase CSS

    const movieImg = document.createElement('img'); // Crea imagen de la película
    movieImg.classList.add('movie-img'); // Clase CSS para estilo
    movieImg.setAttribute('alt', movie.title); // Texto alternativo con el nombre de la película
    movieImg.setAttribute(
      'src',
      'https://image.tmdb.org/t/p/w300' + movie.poster_path, // Imagen del póster con tamaño w300
    );

    movieContainer.appendChild(movieImg); // Agrega la imagen al contenedor
    container.appendChild(movieContainer); // Agrega el contenedor al DOM
  });
}

// Función que recibe un arreglo de categorías y un contenedor, y las inserta en el DOM con navegación activada por click
function createCategories(categories, container) {
  container.innerHTML = ""; // Limpia el contenedor

  categories.forEach(category => {
    const categoryContainer = document.createElement('div'); // Crea contenedor por categoría
    categoryContainer.classList.add('category-container'); // Asigna clase CSS

    const categoryTitle = document.createElement('h3'); // Crea el título <h3>
    categoryTitle.classList.add('category-title'); // Clase CSS
    categoryTitle.setAttribute('id', 'id' + category.id); // ID único por categoría

    // Evento que cambia el hash para activar navegación a la vista por categoría
    categoryTitle.addEventListener('click', () => {
      location.hash = `#category=${category.id}-${category.name}`;
    });

    const categoryTitleText = document.createTextNode(category.name); // Nodo de texto con el nombre de la categoría

    categoryTitle.appendChild(categoryTitleText); // Inserta texto dentro del título
    categoryContainer.appendChild(categoryTitle); // Inserta título dentro del contenedor
    container.appendChild(categoryContainer); // Agrega el contenedor al DOM
  });
}


// ============ LLAMADAS A LA API ============

// Carga películas en tendencia para la vista previa (inicio)
async function getTrendingMoviesPreview() {
  const { data } = await api('trending/movie/day'); // Endpoint de películas en tendencia
  const movies = data.results; // Se extraen los resultados

  createMovies(movies, trendingMoviesPreviewList); // Renderiza las películas en su sección
}

// Carga las categorías de películas disponibles y las muestra
async function getCategegoriesPreview() {
  const { data } = await api('genre/movie/list'); // Endpoint de categorías
  const categories = data.genres;

  createCategories(categories, categoriesPreviewList); // Renderiza las categorías
}

// Carga películas que pertenecen a una categoría específica (por ID)
async function getMoviesByCategory(id) {
  const { data } = await api('discover/movie', {
    params: {
      with_genres: id, // Se pasa el ID del género como parámetro
    },
  });
  const movies = data.results;

  createMovies(movies, genericSection); // Renderiza resultados en sección genérica
}

// Carga películas según una búsqueda por texto (query)
async function getMoviesBySearch(query) {
  const { data } = await api('search/movie', {
    params: {
      query, // Se pasa el texto buscado como parámetro
    },
  });
  const movies = data.results;

  createMovies(movies, genericSection); // Renderiza resultados en sección genérica
}

// Carga todas las películas en tendencia completas (no solo vista previa)
async function getTrendingMovies() {
  const { data } = await api('trending/movie/day'); // Igual que preview pero orientado a vista completa
  const movies = data.results;

  createMovies(movies, genericSection); // Renderiza en sección genérica
}
