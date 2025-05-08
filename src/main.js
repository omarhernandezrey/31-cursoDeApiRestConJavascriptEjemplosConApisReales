// Se crea una instancia personalizada de Axios para conectarse con la API de The Movie Database
const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/', // URL base para todas las peticiones a la API
  headers: {
    'Content-Type': 'application/json;charset=utf-8', // Se indica que las respuestas serán en formato JSON
  },
  params: {
    'api_key': API_KEY, // Se agrega la clave de API a todas las peticiones como parámetro por defecto
  },
});


// FUNCIONES UTILITARIAS (Utils)

// Función que recibe un arreglo de películas y un contenedor, y las renderiza dinámicamente en el DOM
function createMovies(movies, container) {
  container.innerHTML = ''; // Limpia el contenido previo del contenedor para evitar duplicados

  movies.forEach(movie => {
    // Crea un div que contendrá la imagen de la película
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container'); // Se le asigna clase CSS

    // Crea un elemento de imagen para el póster de la película
    const movieImg = document.createElement('img');
    movieImg.classList.add('movie-img'); // Clase CSS para estilos
    movieImg.setAttribute('alt', movie.title); // Texto alternativo (accesibilidad)
    movieImg.setAttribute(
      'src',
      'https://image.tmdb.org/t/p/w300' + movie.poster_path, // Se arma la URL completa del póster
    );

    // Inserta la imagen dentro del contenedor de la película
    movieContainer.appendChild(movieImg);

    // Inserta el contenedor de la película dentro del contenedor principal recibido como parámetro
    container.appendChild(movieContainer);
  });
}

// Función que recibe un arreglo de categorías y un contenedor, y las muestra dinámicamente en el DOM
function createCategories(categories, container) {
  container.innerHTML = ""; // Limpia el contenedor para evitar contenido duplicado

  categories.forEach(category => {
    // Crea un contenedor para cada categoría
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('category-container'); // Clase CSS

    // Crea el título (nombre) de la categoría
    const categoryTitle = document.createElement('h3');
    categoryTitle.classList.add('category-title'); // Clase CSS
    categoryTitle.setAttribute('id', 'id' + category.id); // Se asigna un ID único

    // Se agrega un evento al hacer clic que cambia el hash y activa la navegación
    categoryTitle.addEventListener('click', () => {
      location.hash = `#category=${category.id}-${category.name}`; // Se navega a la categoría seleccionada
    });

    // Se crea el nodo de texto con el nombre de la categoría
    const categoryTitleText = document.createTextNode(category.name);

    // Se arma la estructura: texto dentro del título, y título dentro del contenedor
    categoryTitle.appendChild(categoryTitleText);
    categoryContainer.appendChild(categoryTitle);

    // Se agrega el contenedor al contenedor principal recibido como parámetro
    container.appendChild(categoryContainer);
  });
}


// LLAMADAS A LA API

// Función que obtiene las películas en tendencia del día y las muestra en la sección de vista previa
async function getTrendingMoviesPreview() {
  const { data } = await api('trending/movie/day'); // Petición al endpoint de películas en tendencia
  const movies = data.results; // Se extraen las películas desde la respuesta

  createMovies(movies, trendingMoviesPreviewList); // Se pasan las películas al generador de HTML
}

// Función que obtiene las categorías de películas y las muestra en la vista previa
async function getCategegoriesPreview() {
  const { data } = await api('genre/movie/list'); // Petición al endpoint de géneros
  const categories = data.genres; // Se extraen las categorías desde la respuesta

  createCategories(categories, categoriesPreviewList); // Se pasan al generador de categorías
}

// Función que obtiene películas filtradas por una categoría específica (por ID)
async function getMoviesByCategory(id) {
  // Petición al endpoint de descubrimiento filtrando por ID de género
  const { data } = await api('discover/movie', {
    params: {
      with_genres: id, // Se añade el parámetro con el ID del género
    },
  });
  const movies = data.results; // Se extraen las películas desde la respuesta

  createMovies(movies, genericSection); // Se renderizan en la sección genérica del DOM
}
