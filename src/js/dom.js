// src/js/dom.js
import { getFullImageUrl } from './api.js';

export const elements = {
  headerBackBtn: document.querySelector('.header__back-btn'),
  viewAllBtn: document.querySelector('.view-all-btn'),
  heroBtn: document.querySelector('.hero__btn'),
  closeModalBtn: document.querySelector('.close-modal-btn'),
  searchForm: document.getElementById('searchForm'),
  searchInput: document.querySelector('.search-input'),

  headerTitle: document.querySelector('.header__title'),
  headerCategoryTitle: document.querySelector('.header__title--category'),
  heroSection: document.getElementById('hero'),

  trendingSection: document.getElementById('trendingPreview'),
  trendingMoviesList: document.getElementById('trendingMoviesList'),

  categoriesSection: document.getElementById('categoriesPreview'),
  categoriesList: document.getElementById('categoriesList'),

  genericListSection: document.getElementById('genericList'),
  moviesGrid: document.getElementById('moviesGrid'),

  movieDetailSection: document.getElementById('movieDetail'),
  movieDetailHero: document.querySelector('.movie-detail__hero'),
  moviePoster: document.getElementById('moviePoster'),
  movieDetailTitle: document.getElementById('movieDetailTitle'),
  movieRating: document.getElementById('movieRating'),
  movieRuntime: document.getElementById('movieRuntime'),
  movieYear: document.getElementById('movieYear'),
  movieTags: document.getElementById('movieTags'),
  movieDescription: document.getElementById('movieDescription'),
  castGrid: document.getElementById('movieCast'),
  watchTrailerBtn: document.getElementById('watchTrailerBtn'),

  similarMoviesList: document.getElementById('similarMoviesList'),

  trailerModal: document.getElementById('trailerModal'),
  trailerContainer: document.getElementById('trailerContainer'),
};

export const createMovieCard = ({ id, title, poster_path, vote_average, release_date }) => {
  const year = release_date?.split('-')[0] || 'N/A';
  return `
    <div class="movie-card" data-id="${id}">
      <img src="${getFullImageUrl(poster_path)}" alt="${title}" class="movie-card__img" loading="lazy" onerror="this.src='./src/img/no-image.jpg'">
      <div class="movie-card__overlay">
        <div class="movie-card__info">
          <h3 class="movie-card__title">${title}</h3>
          <div class="movie-card__meta">
            <span class="movie-card__rating"><i class="fas fa-star"></i> ${vote_average?.toFixed(1) || 'N/A'}</span>
            <span class="movie-card__year">${year}</span>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const createCategoryCard = ({ id, name }) => `
  <div class="category-card" data-id="${id}">
    <h3 class="category-name">${name}</h3>
    <div class="category-overlay"></div>
  </div>
`;

export const createCastCard = ({ profile_path, name, character }) => `
  <div class="cast-card">
    <img src="${getFullImageUrl(profile_path, 'w185')}" alt="${name}" class="cast-card__img" loading="lazy" onerror="this.src='./src/img/no-avatar.png'">
    <h4 class="cast-card__name">${name}</h4>
    <p class="cast-card__character">${character || 'N/A'}</p>
  </div>
`;

export const renderList = (items, createCardFn, container) => {
  container.innerHTML = items.length
    ? items.map(item => createCardFn(item)).join('')
    : '<p class="no-results">No se encontraron resultados</p>';
};
