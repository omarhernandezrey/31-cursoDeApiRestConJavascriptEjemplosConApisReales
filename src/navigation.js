// ============ EVENTOS DE NAVEGACIÓN ============

// Al hacer clic en el botón de búsqueda, se captura el valor del input y se cambia el hash con la query
searchFormBtn.addEventListener('click', () => {
  location.hash = '#search=' + searchFormInput.value;
});

// Botón de tendencias: redirige a la vista de tendencias
trendingBtn.addEventListener('click', () => {
  location.hash = '#trends';
});

// Botón de flecha atrás: usa el historial del navegador para volver a la página anterior
arrowBtn.addEventListener('click', () => {
  history.back(); // ← importante: retrocede una página del historial
  // location.hash = '#home'; // (ya no se usa porque se usa history.back())
});

// Se ejecuta navigator al cargar el DOM o cambiar el hash
window.addEventListener('DOMContentLoaded', navigator, false);
window.addEventListener('hashchange', navigator, false);


// ============ FUNCIÓN DE RUTEO PRINCIPAL ============

function navigator() {
  console.log({ location });

  // Se redirige según el hash actual
  if (location.hash.startsWith('#trends')) {
    trendsPage();
  } else if (location.hash.startsWith('#search=')) {
    searchPage();
  } else if (location.hash.startsWith('#movie=')) {
    movieDetailsPage();
  } else if (location.hash.startsWith('#category=')) {
    categoriesPage();
  } else {
    homePage();
  }

  // Siempre hace scroll al inicio al cambiar de vista
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}


// ============ VISTAS ============

// VISTA PRINCIPAL
function homePage() {
  console.log('Home!!');

  // Header corto y sin fondo
  headerSection.classList.remove('header-container--long');
  headerSection.style.background = '';

  // Oculta flecha atrás y activa título e input
  arrowBtn.classList.add('inactive');
  arrowBtn.classList.remove('header-arrow--white');
  headerTitle.classList.remove('inactive');
  headerCategoryTitle.classList.add('inactive');
  searchForm.classList.remove('inactive');

  // Muestra secciones principales
  trendingPreviewSection.classList.remove('inactive');
  categoriesPreviewSection.classList.remove('inactive');

  // Oculta otras secciones
  genericSection.classList.add('inactive');
  movieDetailSection.classList.add('inactive');
  
  // Carga contenido
  getTrendingMoviesPreview();
  getCategegoriesPreview();
}

// VISTA DE CATEGORÍAS
function categoriesPage() {
  console.log('categories!!');

  headerSection.classList.remove('header-container--long');
  headerSection.style.background = '';
  arrowBtn.classList.remove('inactive');
  arrowBtn.classList.remove('header-arrow--white');
  headerTitle.classList.add('inactive');
  headerCategoryTitle.classList.remove('inactive');
  searchForm.classList.add('inactive');

  trendingPreviewSection.classList.add('inactive');
  categoriesPreviewSection.classList.add('inactive');
  genericSection.classList.remove('inactive');
  movieDetailSection.classList.add('inactive');

  // Extrae ID y nombre desde el hash
  const [_, categoryData] = location.hash.split('=');
  const [categoryId, categoryName] = categoryData.split('-');

  // Muestra el nombre de la categoría como título
  headerCategoryTitle.innerHTML = categoryName;
  
  // Carga las películas de la categoría
  getMoviesByCategory(categoryId);
}

// VISTA DE DETALLE DE PELÍCULA
function movieDetailsPage() {
  console.log('Movie!!');

  headerSection.classList.add('header-container--long');
  arrowBtn.classList.remove('inactive');
  arrowBtn.classList.add('header-arrow--white');
  headerTitle.classList.add('inactive');
  headerCategoryTitle.classList.add('inactive');
  searchForm.classList.add('inactive');

  trendingPreviewSection.classList.add('inactive');
  categoriesPreviewSection.classList.add('inactive');
  genericSection.classList.add('inactive');
  movieDetailSection.classList.remove('inactive');

  // (Puedes agregar lógica para cargar los detalles aquí)
}

// VISTA DE BÚSQUEDA
function searchPage() {
  console.log('Search!!');

  headerSection.classList.remove('header-container--long');
  headerSection.style.background = '';
  arrowBtn.classList.remove('inactive');
  arrowBtn.classList.remove('header-arrow--white');
  headerTitle.classList.add('inactive');
  headerCategoryTitle.classList.add('inactive');
  searchForm.classList.remove('inactive');

  trendingPreviewSection.classList.add('inactive');
  categoriesPreviewSection.classList.add('inactive');
  genericSection.classList.remove('inactive');
  movieDetailSection.classList.add('inactive');

  // Extrae la query desde el hash
  const [_, query] = location.hash.split('=');

  // Realiza la búsqueda
  getMoviesBySearch(query);
}

// VISTA DE TENDENCIAS COMPLETA
function trendsPage() {
  console.log('TRENDS!!');

  headerSection.classList.remove('header-container--long');
  headerSection.style.background = '';
  arrowBtn.classList.remove('inactive');
  arrowBtn.classList.remove('header-arrow--white');
  headerTitle.classList.add('inactive');
  headerCategoryTitle.classList.remove('inactive');
  searchForm.classList.add('inactive');

  trendingPreviewSection.classList.add('inactive');
  categoriesPreviewSection.classList.add('inactive');
  genericSection.classList.remove('inactive');
  movieDetailSection.classList.add('inactive');

  // Actualiza el título de la vista
  headerCategoryTitle.innerHTML = 'Tendencias';

  // Carga todas las películas en tendencia (no solo preview)
  getTrendingMovies();
}
