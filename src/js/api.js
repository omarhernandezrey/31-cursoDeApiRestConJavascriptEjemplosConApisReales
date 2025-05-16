// /home/omar/personalProjects/31-cursoDeApiRestConJavascriptEjemplosConApisReales/src/js/api.js
import { API_KEY, BASE_URL, IMG_BASE_URL, DEFAULT_LANGUAGE } from './config.js';
import axios from 'axios';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json;charset=utf-8', 'Cache-Control': 'no-cache' },
  params: { api_key: API_KEY, language: DEFAULT_LANGUAGE },
  timeout: 10000
});

export const getTrendingMovies = async (timeWindow = 'day') => {
  const { data } = await api(`trending/movie/${timeWindow}`);
  return data.results || [];
};

export const getCategories = async () => {
  const { data } = await api('genre/movie/list');
  return data.genres || [];
};

export const getMoviesByCategory = async (categoryId, page = 1) => {
  const { data } = await api('discover/movie', { params: { with_genres: categoryId, page } });
  return { results: data.results || [], totalPages: data.total_pages || 1 };
};

export const searchMovies = async (query, page = 1) => {
  const { data } = await api('search/movie', { params: { query, page } });
  return { results: data.results || [], totalPages: data.total_pages || 1 };
};

export const getMovieDetails = async (movieId) => {
  const [movie, videos, credits, similar] = await Promise.all([
    api(`movie/${movieId}`),
    api(`movie/${movieId}/videos`),
    api(`movie/${movieId}/credits`),
    api(`movie/${movieId}/similar`)
  ]);
  return {
    ...movie.data,
    videos: videos.data.results || [],
    cast: credits.data.cast?.slice(0, 6) || [],
    similar: similar.data.results?.slice(0, 6) || []
  };
};

export const getFullImageUrl = (path, size = 'w300') =>
  path ? `${IMG_BASE_URL}${size}${path}` : './src/img/no-image.jpg';
