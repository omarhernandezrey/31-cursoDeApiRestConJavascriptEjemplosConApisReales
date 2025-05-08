// Se crea una instancia personalizada de Axios con configuración base para usar en todas las peticiones
const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/', // URL base de la API
  headers: {
    'Content-Type': 'application/json;charset=utf-8', // Formato esperado
  },
  params: {
    'api_key': API_KEY, // Clave API agregada como parámetro por defecto
  },
});


// ===================== UTILS =====================

// Limpia el scroll vertical para evitar que el usuario quede en mitad de una vista anterior (DRY aplicado en navegación)
function scrollToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

// Crea e inserta dinámicamente películas en el contenedor indicado
function createMovies(movies, container) {
  container.innerHTML = ''; // Elimina contenido previo para evitar duplicados

  movies.forEach(movie => {
    const movieContainer = document.createElement('div'); // Contenedor de cada película
    movieContainer.classList.add('movie-container');

    const movieImg = document.createElement('img'); // Imagen de la película
    movieImg.classList.add('movie-img');
    movieImg.setAttribute('alt', movie.title); // Accesibilidad: nombre de la película
    movieImg.setAttribute(
      'src',
      'https://image.tmdb.org/t/p/w300' + movie.poster_path, // URL del póster
    );

    movieContainer.appendChild(movieImg); // Se agrega la imagen al contenedor
    container.appendChild(movieContainer); // Se agrega el contenedor a la lista
  });
}

// Crea e inserta dinámicamente categorías en el contenedor indicado
function createCategories(categories, container) {
  container.innerHTML = ""; // Limpia el contenedor

  categories.forEach(category => {
    const categoryContainer = document.createElement('div'); // Contenedor de cada categoría
    categoryContainer.classList.add('category-container');

    const categoryTitle = document.createElement('h3'); // Título visible de la categoría
    categoryTitle.classList.add('category-title');
    categoryTitle.setAttribute('id', 'id' + category.id); // ID único para cada categoría

    // Evento que cambia el hash de la URL al hacer clic en la categoría
    categoryTitle.addEventListener('click', () => {
      location.hash = `#category=${category.id}-${category.name}`;
    });

    const categoryTitleText = document.createTextNode(category.name); // Texto con el nombre de la categoría

    categoryTitle.appendChild(categoryTitleText); // Inserta el texto en el título
    categoryContainer.appendChild(categoryTitle); // Inserta el título en el contenedor
    container.appendChild(categoryContainer); // Inserta el contenedor en la lista principal
  });
}


// ===================== LLAMADAS A LA API =====================

// Consulta películas en tendencia y las muestra en la vista previa
async function getTrendingMoviesPreview() {
  const { data } = await api('trending/movie/day'); // Petición al endpoint de tendencias
  const movies = data.results; // Se extraen las películas del resultado

  createMovies(movies, trendingMoviesPreviewList); // Se renderizan en la vista
}

// Consulta las categorías disponibles y las muestra en la vista previa
async function getCategegoriesPreview() {
  const { data } = await api('genre/movie/list'); // Petición al endpoint de géneros
  const categories = data.genres;

  createCategories(categories, categoriesPreviewList); // Se renderizan las categorías
}

// Consulta las películas que pertenecen a una categoría específica (usando su ID)
async function getMoviesByCategory(id) {
  const { data } = await api('discover/movie', {
    params: {
      with_genres: id, // Se envía como parámetro el ID de la categoría
    },
  });
  const movies = data.results;

  createMovies(movies, genericSection); // Se renderizan las películas en la sección genérica
}

// Consulta películas por término de búsqueda
async function getMoviesBySearch(query) {
  const { data } = await api('search/movie', {
    params: {
      query, // Se envía como parámetro el texto buscado
    },
  });
  const movies = data.results;

  createMovies(movies, genericSection); // Se renderizan los resultados de búsqueda
}
