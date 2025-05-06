// Se crea una instancia personalizada de Axios con configuración base
const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/', // URL base de la API de The Movie DB
  headers: {
    'Content-Type': 'application/json;charset=utf-8', // Formato de contenido esperado
  },
  params: {
    'api_key': API_KEY, // Parámetro global de autenticación con tu API key
  },
});

// Función asincrónica que obtiene y muestra las películas en tendencia del día
async function getTrendingMoviesPreview() {
  // Se usa la instancia de Axios para hacer la solicitud al endpoint de películas en tendencia
  const { data } = await api('trending/movie/day');
  const movies = data.results; // Se extrae la lista de películas

  // Por cada película, se crea su contenedor en el HTML
  movies.forEach(movie => {
    // Contenedor padre en el DOM donde se mostrarán las películas
    const trendingPreviewMoviesContainer = document.querySelector('#trendingPreview .trendingPreview-movieList');
    
    // Contenedor individual de película
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container'); // Clase CSS para estilos

    // Imagen del póster de la película
    const movieImg = document.createElement('img');
    movieImg.classList.add('movie-img'); // Clase CSS
    movieImg.setAttribute('alt', movie.title); // Texto alternativo con el nombre de la película
    movieImg.setAttribute(
      'src',
      'https://image.tmdb.org/t/p/w300' + movie.poster_path, // Ruta completa del póster
    );

    // Se arma el DOM: la imagen dentro del contenedor, y este dentro del contenedor general
    movieContainer.appendChild(movieImg);
    trendingPreviewMoviesContainer.appendChild(movieContainer);
  });
}

// Función asincrónica que obtiene y muestra la lista de categorías de películas
async function getCategegoriesPreview() {
  // Se hace la petición al endpoint de géneros (categorías) de películas
  const { data } = await api('genre/movie/list');
  const categories = data.genres; // Se extrae la lista de categorías

  // Por cada categoría, se construye un contenedor en el HTML
  categories.forEach(category => {
    // Contenedor padre donde se mostrarán las categorías
    const previewCategoriesContainer = document.querySelector('#categoriesPreview .categoriesPreview-list');
    
    // Contenedor individual de categoría
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('category-container'); // Clase CSS

    // Título de la categoría (nombre del género)
    const categoryTitle = document.createElement('h3');
    categoryTitle.classList.add('category-title'); // Clase CSS
    categoryTitle.setAttribute('id', 'id' + category.id); // ID único con el id del género
    const categoryTitleText = document.createTextNode(category.name); // Texto del nombre

    // Armado del DOM: se inserta el texto en el h3, luego el h3 en el contenedor
    categoryTitle.appendChild(categoryTitleText);
    categoryContainer.appendChild(categoryTitle);
    previewCategoriesContainer.appendChild(categoryContainer);
  });
}

// Se ejecutan ambas funciones para cargar datos al iniciar
getTrendingMoviesPreview();
getCategegoriesPreview();
