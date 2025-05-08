// ============ EVENTOS DE NAVEGACIÓN ============

// Botón de búsqueda: actualiza el hash con el valor del input para activar la vista de búsqueda
searchFormBtn.addEventListener('click', () => {
  location.hash = '#search=' + searchFormInput.value;
});

// Botón de ver más tendencias: actualiza el hash para activar la vista de tendencias
trendingBtn.addEventListener('click', () => {
  location.hash = '#trends';
});

// Botón de flecha hacia atrás: regresa a la vista principal
arrowBtn.addEventListener('click', () => {
  location.hash = '#home';
});

// Al cargar la página o al cambiar el hash, se ejecuta la navegación
window.addEventListener('DOMContentLoaded', navigator, false);
window.addEventListener('hashchange', navigator, false);


// ============ FUNCIÓN DE NAVEGACIÓN PRINCIPAL ============

function navigator() {
  console.log({ location }); // Muestra la URL actual para depuración

  // Se determina qué vista cargar según el hash de la URL
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

  // Se asegura de que la vista siempre comience desde arriba
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}


// ============ VISTAS ============

// VISTA PRINCIPAL
function homePage() {
  console.log('Home!!');

  // Reset visual del header
  headerSection.classList.remove('header-container--long');
  headerSection.style.background = '';

  // Se oculta flecha de retroceso y se muestran encabezado e input
  arrowBtn.classList.add('inactive');
  arrowBtn.classList.remove('header-arrow--white');
  headerTitle.classList.remove('inactive');
  headerCategoryTitle.classList.add('inactive');
  searchForm.classList.remove('inactive');

  // Se muestran las secciones de inicio
  trendingPreviewSection.classList.remove('inactive');
  categoriesPreviewSection.classList.remove('inactive');

  // Se ocultan las secciones no usadas
  genericSection.classList.add('inactive');
  movieDetailSection.classList.add('inactive');
  
  // Se cargan datos
  getTrendingMoviesPreview();
  getCategegoriesPreview();
}

// VISTA POR CATEGORÍA
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

  // Extrae ID y nombre desde el hash, ejemplo: #category=12-Action
  const [_, categoryData] = location.hash.split('=');
  const [categoryId, categoryName] = categoryData.split('-');

  // Se muestra el nombre de la categoría en el encabezado
  headerCategoryTitle.innerHTML = categoryName;

  // Se cargan las películas de esa categoría
  getMoviesByCategory(categoryId);
}

// VISTA DE DETALLE DE PELÍCULA
function movieDetailsPage() {
  console.log('Movie!!');

  headerSection.classList.add('header-container--long');
  //headerSection.style.background = ''; // (opcional: agregar fondo de imagen de la película)

  arrowBtn.classList.remove('inactive');
  arrowBtn.classList.add('header-arrow--white');

  headerTitle.classList.add('inactive');
  headerCategoryTitle.classList.add('inactive');
  searchForm.classList.add('inactive');

  trendingPreviewSection.classList.add('inactive');
  categoriesPreviewSection.classList.add('inactive');
  genericSection.classList.add('inactive');
  movieDetailSection.classList.remove('inactive');
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

  // Extrae el texto de búsqueda del hash: #search=batman
  const [_, query] = location.hash.split('=');

  // Se hace la búsqueda y se muestra el resultado
  getMoviesBySearch(query);
}

// VISTA DE TENDENCIAS
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

  // Aquí podrías llamar a getTrendingMovies() si tuvieras una versión completa, no solo el preview
}
