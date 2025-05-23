// src/js/config.js

const LOCAL_KEY = 'd7de1b799dda4d093941deb886750e75';

export const API_KEY = window.location.hostname === 'localhost'
  ? LOCAL_KEY
  : ''; // 👉 pon aquí tu clave si Vercel necesita acceso público

export const BASE_URL = 'https://api.themoviedb.org/3/';
export const IMG_BASE_URL = 'https://image.tmdb.org/t/p/';
export const DEFAULT_LANGUAGE = 'es-ES';
