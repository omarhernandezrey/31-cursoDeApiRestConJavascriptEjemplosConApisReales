// Se crea una instancia personalizada de Axios con configuración base para la API
const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/', // Dirección base de la API
  headers: {
    'Content-Type': 'application/json;charset=utf-8', // Formato esperado
  },
  params: {
    'api_key': API_KEY, // Parámetro global para autenticación
  },
});

// Función para obtener y renderizar películas en tendencia
async function getTrendingMoviesPreview() {
  const { data } = await api('trending/movie/day'); // Se consulta la API
  const movies = data.results; // Se extrae la lista de películas

  trendingMoviesPreviewList.innerHTML = ""; // Se limpia el contenedor antes de insertar nuevas películas

  // Por cada película se genera su estructura en el DOM
  movies.forEach(movie => {
    const movieContainer = document.createElement('div');
    movieContainer.classList.add('movie-container'); // Clase CSS para estilos

    const movieImg = document.createElement('img');
    movieImg.classList.add('movie-img'); // Clase CSS para estilos
    movieImg.setAttribute('alt', movie.title); // Texto alternativo con el título
    movieImg.setAttribute(
      'src',
      'https://image.tmdb.org/t/p/w300' + movie.poster_path, // Ruta del póster con tamaño w300
    );

    movieContainer.appendChild(movieImg); // Se inserta la imagen en el contenedor
    trendingMoviesPreviewList.appendChild(movieContainer); // Se inserta el contenedor en la lista principal
  });
}

// Función para obtener y renderizar las categorías de películas
async function getCategegoriesPreview() {
  const { data } = await api('genre/movie/list'); // Se consulta el endpoint de géneros
  const categories = data.genres; // Se extrae la lista de géneros

  categoriesPreviewList.innerHTML = ""; // Se limpia el contenedor antes de insertar nuevas categorías

  // Por cada categoría se genera su estructura en el DOM
  categories.forEach(category => {
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('category-container'); // Clase para estilos

    const categoryTitle = document.createElement('h3');
    categoryTitle.classList.add('category-title'); // Clase para estilos
    categoryTitle.setAttribute('id', 'id' + category.id); // ID único para el título
    const categoryTitleText = document.createTextNode(category.name); // Texto del nombre de la categoría

    categoryTitle.appendChild(categoryTitleText); // Se inserta el texto en el título
    categoryContainer.appendChild(categoryTitle); // Se inserta el título en el contenedor
    categoriesPreviewList.appendChild(categoryContainer); // Se inserta el contenedor en la lista principal
  });
}
