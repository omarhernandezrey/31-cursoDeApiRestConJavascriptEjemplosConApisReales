/* ======================================================================
   src/js/api.js           —  VERSIÓN COMPATIBLE CON TODOS LOS NAVEGADORES
   • Usa Axios global cargado desde CDN (no usa import)
   • Compatible con iPhone 7 / iOS antiguos
   ====================================================================== */

import { API_KEY, BASE_URL, IMG_BASE_URL, DEFAULT_LANGUAGE } from './config.js';

/* Axios global (desde CDN clásico) */
const api = window.axios.create({
  baseURL : BASE_URL,
  headers : { 'Content-Type':'application/json;charset=utf-8', 'Cache-Control':'no-cache' },
  params  : { api_key: API_KEY, language: DEFAULT_LANGUAGE },
  timeout : 10000,
});

/* ────────────────────────────────────────────────────────────
   1.  TENDENCIAS
   ──────────────────────────────────────────────────────────── */
export async function getTrendingMovies (timeWindow = 'day', page = 1) {
  const { data } = await api(`trending/movie/${timeWindow}`, { params:{ page } });
  return normaliseListResponse(data);
}

/* ────────────────────────────────────────────────────────────
   2.  CATEGORÍAS
   ──────────────────────────────────────────────────────────── */
export async function getCategories () {
  const { data } = await api('genre/movie/list');
  return data.genres ?? [];
}

/* ────────────────────────────────────────────────────────────
   3.  PELÍCULAS POR CATEGORÍA
   ──────────────────────────────────────────────────────────── */
export async function getMoviesByCategory (categoryId, page = 1) {
  const { data } = await api('discover/movie', {
    params: { with_genres: categoryId, page },
  });
  return normaliseListResponse(data);
}

/* ────────────────────────────────────────────────────────────
   4.  BÚSQUEDA
   ──────────────────────────────────────────────────────────── */
export async function searchMovies (query, page = 1) {
  const { data } = await api('search/movie', {
    params: { query, page, include_adult: false },
  });
  return normaliseListResponse(data);
}

/* ────────────────────────────────────────────────────────────
   5.  DETALLE COMPLETO
   ──────────────────────────────────────────────────────────── */
export async function getMovieDetails (movieId) {
  const [movie, videos, credits, similar] = await Promise.all([
    api(`movie/${movieId}`),
    api(`movie/${movieId}/videos`),
    api(`movie/${movieId}/credits`),
    api(`movie/${movieId}/similar`, { params: { page: 1 } }),
  ]);

  return {
    ...movie.data,
    videos : videos.data.results ?? [],
    cast   : credits.data.cast?.slice(0, 10) ?? [],
    similar: similar.data.results?.slice(0, 6) ?? [],
  };
}

/* ────────────────────────────────────────────────────────────
   6.  UTILIDAD DE IMAGEN
   ──────────────────────────────────────────────────────────── */
export function getFullImageUrl (path, size = 'w300') {
  return path ? `${IMG_BASE_URL}${size}${path}` : './src/img/no-image.jpg';
}

/* ────────────────────────────────────────────────────────────
   7.  HOMOGENEIZAR RESPUESTA
   ──────────────────────────────────────────────────────────── */
function normaliseListResponse (data = {}) {
  return {
    page         : data.page ?? 1,
    results      : data.results ?? [],
    total_pages  : data.total_pages ?? 1,
    total_results: data.total_results ?? data.results?.length ?? 0,
  };
}
