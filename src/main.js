// Función asincrónica que obtiene las películas en tendencia del día desde la API de The Movie Database
async function getTrendingMoviesPreview() {
    // Se hace una solicitud HTTP GET a la API con la clave proporcionada
    const res = await fetch('https://api.themoviedb.org/3/trending/movie/day?api_key=' + API_KEY);
    
    // Se convierte la respuesta en formato JSON para poder manipularla
    const data = await res.json();
  
    // Se extrae la lista de películas desde la propiedad 'results' del objeto recibido
    const movies = data.results;
  
    // Por cada película en la lista...
    movies.forEach(movie => {
      // Se selecciona el contenedor del HTML donde se mostrarán las películas en tendencia
      const trendingPreviewMoviesContainer = document.querySelector('#trendingPreview .trendingPreview-movieList');
  
      // Se crea un nuevo contenedor <div> para una película individual
      const movieContainer = document.createElement('div');
      movieContainer.classList.add('movie-container'); // Se le asigna la clase para estilos
  
      // Se crea un elemento <img> para mostrar el póster de la película
      const movieImg = document.createElement('img');
      movieImg.classList.add('movie-img'); // Se le asigna la clase para estilos
      movieImg.setAttribute('alt', movie.title); // Se agrega texto alternativo con el título de la película
      movieImg.setAttribute(
        'src',
        'https://image.tmdb.org/t/p/w300' + movie.poster_path, // Se establece la URL de la imagen del póster
      );
  
      // Se agrega la imagen al contenedor de la película
      movieContainer.appendChild(movieImg);
  
      // Se agrega el contenedor de la película al listado de películas en tendencia del DOM
      trendingPreviewMoviesContainer.appendChild(movieContainer);
    });
  }
  
  // Se llama a la función para que se ejecute al cargar el archivo
  getTrendingMoviesPreview();
  