// ============ EVENTOS DE NAVEGACIÓN ============

// Al hacer clic en el botón de búsqueda, se actualiza el hash con la query
searchFormBtn.addEventListener('click', () => {
  location.hash = '#search=' + searchFormInput.value;
});

// Al hacer clic en "Ver más" de tendencias, se redirige a la vista de tendencias completas
trendingBtn.addEventListener('click', () => {
  location.hash = '#trends';
});

// Flecha atrás: usa el historial del navegador para retroceder
arrowBtn.addEventListener('click', () => {
  history.back(); // ← vuelve a la página anterior, útil para historial real
  // location.hash = '#home'; // alternativa directa (desactivada)
});

// Al cargar el DOM o cambiar el hash, se ejecuta la navegación
window.addEventListener('DOMContentLoaded', navigator, false);
window.addEventListener('hashchange', navigator, false);


// ============ FUNCIÓN DE NAVEGACIÓN PRINCIPAL ============

function navigator() {
  console.log({ location });

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

  // Siempre reinicia scroll al cambiar de vista
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}


// ============ VISTAS DINÁMICAS ============

// HOME
function homePage() {
  console.log('Home!!');

  headerSection.classList.remove('header-container--long');
  headerSection.style.background = '';
  arrowBtn.classList.add('inactive');
  arrowBtn.classList.remove('header-arrow--white');
  headerTitle.classList.remove('inactive');
  headerCategoryTitle.classList.add('inactive');
  searchForm.classList.remove('inactive');

  trendingPreviewSection.classList.remove('inactive');
  categoriesPreviewSection.classList.remove('inactive');
  genericSection.classList.add('inactive');
  movieDetailSection.classList.add('inactive');

  getTrendingMoviesPreview();
  getCategegoriesPreview();
}

// CATEGORÍAS
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

  headerCategoryTitle.innerHTML = categoryName;

  getMoviesByCategory(categoryId);
}

// DETALLE DE PELÍCULA
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

  // Extrae el ID de la película del hash
  const [_, movieId] = location.hash.split('=');
  getMovieById(movieId);
}

// BÚSQUEDA
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

  // Extrae el término de búsqueda del hash
  const [_, query] = location.hash.split('=');
  getMoviesBySearch(query);
}

// TENDENCIAS COMPLETAS
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

  headerCategoryTitle.innerHTML = 'Tendencias';

  getTrendingMovies();
}
