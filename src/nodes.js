// SECCIONES PRINCIPALES
const headerSection = document.querySelector('#header'); // Encabezado principal
const trendingPreviewSection = document.querySelector('#trendingPreview'); // Sección de películas en tendencia
const categoriesPreviewSection = document.querySelector('#categoriesPreview'); // Sección de categorías
const genericSection = document.querySelector('#genericList'); // Sección genérica reutilizable
const movieDetailSection = document.querySelector('#movieDetail'); // Sección de detalle de una película

// LISTAS Y CONTENEDORES
const searchForm = document.querySelector('#searchForm'); // Formulario de búsqueda
const trendingMoviesPreviewList = document.querySelector('.trendingPreview-movieList'); // Lista de películas en tendencia
const categoriesPreviewList = document.querySelector('.categoriesPreview-list'); // Lista de categorías
const movieDetailCategoriesList = document.querySelector('#movieDetail .categories-list'); // Lista de categorías en detalle de película
const relatedMoviesContainer = document.querySelector('.relatedMovies-scrollContainer'); // Carrusel de películas relacionadas

// ELEMENTOS INDIVIDUALES
const headerTitle = document.querySelector('.header-title'); // Título del encabezado
const arrowBtn = document.querySelector('.header-arrow'); // Botón de flecha (volver)
const headerCategoryTitle = document.querySelector('.header-title--categoryView'); // Título del encabezado en vista de categoría

const searchFormInput = document.querySelector('#searchForm input'); // Campo de texto del buscador
const searchFormBtn = document.querySelector('#searchBtn'); // Botón para activar búsqueda

const trendingBtn = document.querySelector('.trendingPreview-btn'); // Botón para ver más películas en tendencia

const movieDetailTitle = document.querySelector('.movieDetail-title'); // Título de la película en detalle
const movieDetailDescription = document.querySelector('.movieDetail-description'); // Descripción de la película
const movieDetailScore = document.querySelector('.movieDetail-score'); // Puntuación de la película
