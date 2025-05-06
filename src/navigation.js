// Se agregan dos event listeners al objeto window:
// 1. Cuando el contenido HTML esté completamente cargado (DOMContentLoaded)
// 2. Cuando cambie el hash de la URL (hashchange)
// Ambos eventos llaman a la función 'navigator'
window.addEventListener('DOMContentLoaded', navigator, false);
window.addEventListener('hashchange', navigator, false);

// Función principal de navegación que se ejecuta cuando cambia el estado de la URL
function navigator() {
  console.log({ location }); // Se muestra en consola la URL actual para depuración

  // Según el hash en la URL, se llama a la función correspondiente
  if (location.hash.startsWith('#trends')) {
    trendsPage(); // Página de tendencias
  } else if (location.hash.startsWith('#search=')) {
    searchPage(); // Página de resultados de búsqueda
  } else if (location.hash.startsWith('#movie=')) {
    movieDetailsPage(); // Página de detalles de una película
  } else if (location.hash.startsWith('#category=')) {
    categoriesPage(); // Página de una categoría específica
  } else {
    homePage(); // Página principal por defecto
  }
}

// Función para la vista de la página principal
function homePage() {
  console.log('Home!!'); // Mensaje de depuración
  getTrendingMoviesPreview(); // Carga películas en tendencia
  getCategegoriesPreview();   // Carga categorías
}

// Función para la vista de categorías
function categoriesPage() {
  console.log('categories!!'); // Mensaje de depuración
}

// Función para la vista de detalles de película
function movieDetailsPage() {
  console.log('Movie!!'); // Mensaje de depuración
}

// Función para la vista de resultados de búsqueda
function searchPage() {
  console.log('Search!!'); // Mensaje de depuración
}

// Función para la vista de tendencias
function trendsPage() {
  console.log('TRENDS!!'); // Mensaje de depuración
}
