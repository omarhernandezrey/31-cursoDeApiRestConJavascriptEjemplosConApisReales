// Función asincrónica que obtiene y muestra las películas en tendencia del día
async function getTrendingMoviesPreview() {
    // Se hace la solicitud a la API con la API_KEY
    const res = await fetch('https://api.themoviedb.org/3/trending/movie/day?api_key=' + API_KEY);
    // Se convierte la respuesta a formato JSON
    const data = await res.json();
  
    // Se extrae la lista de películas desde el JSON recibido
    const movies = data.results;
  
    // Recorremos todas las películas
    movies.forEach(movie => {
      // Seleccionamos el contenedor del HTML donde se van a insertar las películas
      const trendingPreviewMoviesContainer = document.querySelector('#trendingPreview .trendingPreview-movieList');
  
      // Creamos un div para contener cada película
      const movieContainer = document.createElement('div');
      movieContainer.classList.add('movie-container'); // Se le asigna clase para estilos
  
      // Creamos la imagen de la película
      const movieImg = document.createElement('img');
      movieImg.classList.add('movie-img'); // Clase CSS para estilo
      movieImg.setAttribute('alt', movie.title); // Texto alternativo para accesibilidad
      movieImg.setAttribute(
        'src',
        'https://image.tmdb.org/t/p/w300' + movie.poster_path, // URL del póster (tamaño w300)
      );
  
      // Insertamos la imagen dentro del contenedor
      movieContainer.appendChild(movieImg);
      // Insertamos el contenedor dentro del listado en el DOM
      trendingPreviewMoviesContainer.appendChild(movieContainer);
    });
  }
  
  // Función asincrónica que obtiene y muestra las categorías de películas
  async function getCategegoriesPreview() {
    // Llamado a la API de categorías (géneros)
    const res = await fetch('https://api.themoviedb.org/3/genre/movie/list?api_key=' + API_KEY);
    const data = await res.json();
  
    // Se extrae la lista de géneros
    const categories = data.genres;
  
    // Recorremos todas las categorías
    categories.forEach(category => {
      // Seleccionamos el contenedor donde van las categorías
      const previewCategoriesContainer = document.querySelector('#categoriesPreview .categoriesPreview-list');
  
      // Creamos un div para la categoría individual
      const categoryContainer = document.createElement('div');
      categoryContainer.classList.add('category-container'); // Clase para estilo
  
      // Creamos el elemento de título para la categoría (h3)
      const categoryTitle = document.createElement('h3');
      categoryTitle.classList.add('category-title'); // Clase para estilo
      categoryTitle.setAttribute('id', 'id' + category.id); // Asignamos un ID único usando el id del género
  
      // Creamos el texto con el nombre de la categoría
      const categoryTitleText = document.createTextNode(category.name);
  
      // Insertamos el texto dentro del h3 y luego todo en el contenedor
      categoryTitle.appendChild(categoryTitleText);
      categoryContainer.appendChild(categoryTitle);
      previewCategoriesContainer.appendChild(categoryContainer);
    });
  }
  
  // Ejecutamos ambas funciones para cargar películas y categorías al iniciar
  getTrendingMoviesPreview();
  getCategegoriesPreview();
  