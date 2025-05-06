// EVENTOS DE NAVEGACIÓN
// Al hacer clic en el botón de búsqueda, se actualiza el hash de la URL
searchFormBtn.addEventListener('click', () => {
    location.hash = '#search=';
  });
  
  // Al hacer clic en el botón de tendencias, se actualiza el hash
  trendingBtn.addEventListener('click', () => {
    location.hash = '#trends';
  });
  
  // Al hacer clic en la flecha, se vuelve al home
  arrowBtn.addEventListener('click', () => {
    location.hash = '#home';
  });
  
  // EVENTOS PARA ESCUCHAR CAMBIOS EN EL HASH Y CARGA INICIAL
  window.addEventListener('DOMContentLoaded', navigator, false);
  window.addEventListener('hashchange', navigator, false);
  
  // FUNCIÓN PRINCIPAL DE RUTEO (navegación)
  function navigator() {
    console.log({ location }); // Se imprime la URL actual para depuración
  
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
  }
  
  // PÁGINA DE INICIO
  function homePage() {
    console.log('Home!!');
  
    // Configuración visual de la sección
    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.add('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.remove('inactive');
    headerCategoryTitle.classList.add('inactive');
    searchForm.classList.remove('inactive');
  
    // Secciones visibles
    trendingPreviewSection.classList.remove('inactive');
    categoriesPreviewSection.classList.remove('inactive');
    genericSection.classList.add('inactive');
    movieDetailSection.classList.add('inactive');
    
    // Se cargan los datos
    getTrendingMoviesPreview();
    getCategegoriesPreview();
  }
  
  // PÁGINA DE CATEGORÍAS
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
  }
  
  // PÁGINA DE DETALLE DE PELÍCULA
  function movieDetailsPage() {
    console.log('Movie!!');
  
    headerSection.classList.add('header-container--long');
    // headerSection.style.background = ''; // Puedes personalizarlo según el fondo de cada película
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
  
  // PÁGINA DE RESULTADOS DE BÚSQUEDA
  function searchPage() {
    console.log('Search!!');
  
    headerSection.classList.remove('header-container--long');
    headerSection.style.background = '';
    arrowBtn.classList.remove('inactive');
    arrowBtn.classList.remove('header-arrow--white');
    headerTitle.classList.add('inactive');
    headerCategoryTitle.classList.remove('inactive');
    searchForm.classList.remove('inactive');
  
    trendingPreviewSection.classList.add('inactive');
    categoriesPreviewSection.classList.add('inactive');
    genericSection.classList.remove('inactive');
    movieDetailSection.classList.add('inactive');
  }
  
  // PÁGINA DE TENDENCIAS
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
  }
  