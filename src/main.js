// Se crea una instancia de Axios con configuración personalizada para conectarse a la API de The Movie DB
const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/', // URL base para todos los endpoints de la API
  headers: {
    'Content-Type': 'application/json;charset=utf-8', // Indica que se trabajará con JSON
  },
  params: {
    'api_key': API_KEY, // Se incluye la clave de API como parámetro por defecto
  },
});

// Función asincrónica que obtiene las películas en tendencia del día y las muestra en el HTML
async function getTrendingMoviesPreview() {
  // Se hace la solicitud al endpoint 'trending/movie/day' usando Axios
  const { data } = await api('trending/movie/day');

  // Se extraen los resultados de películas desde la respuesta
  const movies = data.results;

  // Recorremos cada película para crear su representación en el DOM
  movies.forEach(movie => {
    // Contenedor padre donde se mostrarán todas las películas en tendencia
    const trendingPreviewMoviesContainer = document.querySelector('#trendingPreview .trendingPreview-movieList');
    
    // Se crea un contenedor individual para cada película
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container'); // Se asigna la clase para estilos

    // Se crea el elemento de imagen del póster
    const movieImg = document.createElement('img');
    movieImg.classList.add('movie-img'); // Clase para estilos
    movieImg.setAttribute('alt', movie.title); // Texto alternativo (accesibilidad)
    movieImg.setAttribute(
      'src',
      'https://image.tmdb.org/t/p/w300' + movie.poster_path, // Ruta del póster con tamaño w300
    );

    // Se agrega la imagen al contenedor y este al DOM
    movieContainer.appendChild(movieImg);
    trendingPreviewMoviesContainer.appendChild(movieContainer);
  });
}

// Función asincrónica que obtiene las categorías de películas y las muestra en el HTML
async function getCategegoriesPreview() {
  // Se hace la solicitud al endpoint de géneros
  const { data } = await api('genre/movie/list');

  // Se extraen las categorías desde la respuesta
  const categories = data.genres;

  // Recorremos cada categoría para crear su representación en el DOM
  categories.forEach(category => {
    // Contenedor padre donde se mostrarán todas las categorías
    const previewCategoriesContainer = document.querySelector('#categoriesPreview .categoriesPreview-list');
    
    // Se crea un contenedor individual para cada categoría
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('category-container'); // Clase para estilos

    // Se crea el título de la categoría
    const categoryTitle = document.createElement('h3');
    categoryTitle.classList.add('category-title'); // Clase para estilos
    categoryTitle.setAttribute('id', 'id' + category.id); // Se asigna un ID con base en el ID de la categoría
    const categoryTitleText = document.createTextNode(category.name); // Texto con el nombre del género

    // Se arma la estructura HTML e inserta en el DOM
    categoryTitle.appendChild(categoryTitleText);
    categoryContainer.appendChild(categoryTitle);
    previewCategoriesContainer.appendChild(categoryContainer);
  });
}
