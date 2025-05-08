// Se crea instancia de Axios para conectarse con la API de The Movie Database
const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/', // URL base para todos los endpoints
  headers: {
    'Content-Type': 'application/json;charset=utf-8', // Se define el tipo de contenido
  },
  params: {
    'api_key': API_KEY, // Clave de autenticación para todas las peticiones
  },
});

// Función que obtiene las películas en tendencia y evita carga duplicada limpiando el contenedor
async function getTrendingMoviesPreview() {
  const { data } = await api('trending/movie/day'); // Solicitud a endpoint de películas del día
  const movies = data.results;

  trendingMoviesPreviewList.innerHTML = ""; // Previene duplicados limpiando el contenedor antes de insertar

  movies.forEach(movie => {
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container');

    const movieImg = document.createElement('img');
    movieImg.classList.add('movie-img');
    movieImg.setAttribute('alt', movie.title);
    movieImg.setAttribute(
      'src',
      'https://image.tmdb.org/t/p/w300' + movie.poster_path,
    );

    movieContainer.appendChild(movieImg);
    trendingMoviesPreviewList.appendChild(movieContainer);
  });
}

// Función que obtiene y muestra categorías, y previene carga duplicada limpiando antes
async function getCategegoriesPreview() {
  const { data } = await api('genre/movie/list');
  const categories = data.genres;

  categoriesPreviewList.innerHTML = ""; // Limpieza del contenedor para evitar duplicados

  categories.forEach(category => {
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('category-container');

    const categoryTitle = document.createElement('h3');
    categoryTitle.classList.add('category-title');
    categoryTitle.setAttribute('id', 'id' + category.id);
    categoryTitle.addEventListener('click', () => {
      location.hash = `#category=${category.id}-${category.name}`; // Navega a la categoría
    });

    const categoryTitleText = document.createTextNode(category.name);
    categoryTitle.appendChild(categoryTitleText);
    categoryContainer.appendChild(categoryTitle);
    categoriesPreviewList.appendChild(categoryContainer);
  });
}

// Función que obtiene películas por categoría y evita carga duplicada limpiando el contenedor
async function getMoviesByCategory(id) {
  const { data } = await api('discover/movie', {
    params: {
      with_genres: id, // Filtro por género
    },
  });
  const movies = data.results;

  genericSection.innerHTML = ""; // Previene duplicados limpiando el contenedor

  movies.forEach(movie => {
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container');

    const movieImg = document.createElement('img');
    movieImg.classList.add('movie-img');
    movieImg.setAttribute('alt', movie.title);
    movieImg.setAttribute(
      'src',
      'https://image.tmdb.org/t/p/w300' + movie.poster_path,
    );

    movieContainer.appendChild(movieImg);
    genericSection.appendChild(movieContainer);
  });
}
