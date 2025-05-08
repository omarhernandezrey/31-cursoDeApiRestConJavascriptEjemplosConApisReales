// EVENTOS DE NAVEGACIÓN BASADOS EN BOTONES Y CAMBIOS EN LA URL

// Al hacer clic en el botón de búsqueda, se cambia el hash para activar la página de búsqueda
searchFormBtn.addEventListener('click', () => {
  location.hash = '#search=';
});

// Al hacer clic en el botón de ver más tendencias, se cambia el hash para activar la página de tendencias
trendingBtn.addEventListener('click', () => {
  location.hash = '#trends';
});

// Al hacer clic en la flecha de retroceso, se vuelve al home
arrowBtn.addEventListener('click', () => {
  location.hash = '#home';
});

// Se ejecuta la función navigator cuando se carga el DOM por primera vez
window.addEventListener('DOMContentLoaded', navigator, false);

// Se ejecuta la función navigator cada vez que cambia el hash en la URL
window.addEventListener('hashchange', navigator, false);

// FUNCIÓN DE RUTEO PRINCIPAL QUE ACTIVA LA PÁGINA SEGÚN EL HASH
function navigator() {
  console.log({ location }); // Muestra la URL actual en consola para depuración

  // Dependiendo del hash, se llama a la función correspondiente
  if (location.hash.startsWith('#trends')) {
    trendsPage(); // Página de tendencias
  } else if (location.hash.startsWith('#search=')) {
    searchPage(); // Página de búsqueda
  } else if (location.hash.startsWith('#movie=')) {
    movieDetailsPage(); // Página de detalles de película
  } else if (location.hash.startsWith('#category=')) {
    categoriesPage(); // Página de categorías
  } else {
    homePage(); // Página principal
  }

  // Hace scroll automático hacia arriba cada vez que cambia de vista
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

// VISTA PRINCIPAL (HOME)
function homePage() {
  console.log('Home!!');

  // Configuración del header para vista corta (no alargado)
  headerSection.classList.remove('header-container--long');
  headerSection.style.background = '';

  // Se oculta la flecha de retroceso y se restablecen los estilos
  arrowBtn.classList.add('inactive');
  arrowBtn.classList.remove('header-arrow--white');

  // Se muestra el título principal y se oculta el de categoría
  headerTitle.classList.remove('inactive');
  headerCategoryTitle.classList.add('inactive');

  // Se muestra el formulario de búsqueda
  searchForm.classList.remove('inactive');

  // Se muestran las secciones principales
  trendingPreviewSection.classList.remove('inactive');
  categoriesPreviewSection.classList.remove('inactive');

  // Se ocultan las secciones que no corresponden a la vista
  genericSection.classList.add('inactive');
  movieDetailSection.classList.add('inactive');

  // Se cargan películas en tendencia y categorías
  getTrendingMoviesPreview();
  getCategegoriesPreview();
}

// VISTA DE CATEGORÍAS
function categoriesPage() {
  console.log('categories!!');

  // Configuración del header normal
  headerSection.classList.remove('header-container--long');
  headerSection.style.background = '';

  // Se muestra flecha de retroceso
  arrowBtn.classList.remove('inactive');
  arrowBtn.classList.remove('header-arrow--white');

  // Se oculta título principal y se muestra título de categoría
  headerTitle.classList.add('inactive');
  headerCategoryTitle.classList.remove('inactive');

  // Se oculta el formulario de búsqueda
  searchForm.classList.add('inactive');

  // Se ocultan secciones que no aplican y se muestra sección genérica
  trendingPreviewSection.classList.add('inactive');
  categoriesPreviewSection.classList.add('inactive');
  genericSection.classList.remove('inactive');
  movieDetailSection.classList.add('inactive');

  // Se extrae el ID y nombre de categoría desde el hash de la URL
  const [_, categoryData] = location.hash.split('=');
  const [categoryId, categoryName] = categoryData.split('-');

  // Se actualiza el texto del encabezado con el nombre de la categoría
  headerCategoryTitle.innerHTML = categoryName;

  // Se cargan las películas asociadas a esa categoría
  getMoviesByCategory(categoryId);
}

// VISTA DE DETALLE DE UNA PELÍCULA
function movieDetailsPage() {
  console.log('Movie!!');

  // Configura el header largo para mostrar imagen destacada
  headerSection.classList.add('header-container--long');

  // Se muestra la flecha blanca para retroceder
  arrowBtn.classList.remove('inactive');
  arrowBtn.classList.add('header-arrow--white');

  // Se ocultan todos los encabezados y el buscador
  headerTitle.classList.add('inactive');
  headerCategoryTitle.classList.add('inactive');
  searchForm.classList.add('inactive');

  // Se ocultan todas las secciones excepto la de detalle
  trendingPreviewSection.classList.add('inactive');
  categoriesPreviewSection.classList.add('inactive');
  genericSection.classList.add('inactive');
  movieDetailSection.classList.remove('inactive');
}

// VISTA DE BÚSQUEDA DE PELÍCULAS
function searchPage() {
  console.log('Search!!');

  // Configura el header normal
  headerSection.classList.remove('header-container--long');
  headerSection.style.background = '';

  // Se muestra la flecha de retroceso
  arrowBtn.classList.remove('inactive');
  arrowBtn.classList.remove('header-arrow--white');

  // Se oculta el título principal y se muestra el de categoría (puede adaptarse)
  headerTitle.classList.add('inactive');
  headerCategoryTitle.classList.remove('inactive');

  // Se muestra el formulario de búsqueda
  searchForm.classList.remove('inactive');

  // Se muestra la sección genérica y se ocultan las demás
  trendingPreviewSection.classList.add('inactive');
  categoriesPreviewSection.classList.add('inactive');
  genericSection.classList.remove('inactive');
  movieDetailSection.classList.add('inactive');
}

// VISTA DE TENDENCIAS
function trendsPage() {
  console.log('TRENDS!!');

  // Configura el header normal
  headerSection.classList.remove('header-container--long');
  headerSection.style.background = '';

  // Se muestra la flecha de retroceso
  arrowBtn.classList.remove('inactive');
  arrowBtn.classList.remove('header-arrow--white');

  // Se oculta el título principal y se muestra el de categoría (puede adaptarse)
  headerTitle.classList.add('inactive');
  headerCategoryTitle.classList.remove('inactive');

  // Se oculta el buscador
  searchForm.classList.add('inactive');

  // Se muestra la sección genérica y se ocultan las demás
  trendingPreviewSection.classList.add('inactive');
  categoriesPreviewSection.classList.add('inactive');
  genericSection.classList.remove('inactive');
  movieDetailSection.classList.add('inactive');
}
