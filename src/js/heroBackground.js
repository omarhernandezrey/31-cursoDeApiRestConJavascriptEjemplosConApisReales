/* =====================================================================
   src/js/heroBackground.js - Sistema dinámico de backgrounds del hero
   • Rotación automática de fondos de películas recientes
   • Transiciones suaves entre imágenes
   • Información dinámica de película actual
   • Optimizado para rendimiento
   ===================================================================== */

import { getTrendingMovies, getFullImageUrl } from './api.js';

// Función local de ordenamiento por fecha
function orderByDate(arr) { 
  return [...arr].sort((a, b) => {
    const dateA = a.release_date || '1900-01-01';
    const dateB = b.release_date || '1900-01-01';
    const comparison = dateB.localeCompare(dateA);
    if (comparison === 0) {
      return (b.vote_average || 0) - (a.vote_average || 0);
    }
    return comparison;
  }); 
}

class HeroBackgroundManager {
  constructor() {
    this.heroElement = document.getElementById('hero');
    this.backgroundImages = [];
    this.currentIndex = 0;
    this.intervalId = null;
    this.isTransitioning = false;
    this.rotationInterval = 8000; // 8 segundos entre cambios
    
    // Elementos dinámicos de información
    this.movieInfo = null;
    this.navControls = null;
    this.createMovieInfoElement();
    this.createNavigationControls();
  }

  async initialize() {
    try {
      console.log('Inicializando sistema de backgrounds dinámicos...');
      await this.loadRecentMovies();
      this.setupBackgroundRotation();
      this.startRotation();
    } catch (error) {
      console.error('Error inicializando backgrounds dinámicos:', error);
      this.fallbackToStaticBackground();
    }
  }

  async loadRecentMovies() {
    try {
      // Obtener películas recientes de diferentes páginas y períodos para más variedad
      const [weeklyPage1, weeklyPage2, dailyPage1, dailyPage2] = await Promise.all([
        getTrendingMovies('week', 1),
        getTrendingMovies('week', 2), 
        getTrendingMovies('day', 1),
        getTrendingMovies('day', 2)
      ]);

      // Combinar y filtrar películas con buenos backgrounds
      const allMovies = [
        ...weeklyPage1.results || [],
        ...weeklyPage2.results || [],
        ...dailyPage1.results || [],
        ...dailyPage2.results || []
      ];

      // Remover duplicados basado en el ID
      const uniqueMovies = allMovies.filter((movie, index, self) => 
        index === self.findIndex(m => m.id === movie.id)
      );

      // Filtrar películas con backgrounds de calidad y ordenar por fecha
      this.backgroundImages = orderByDate(uniqueMovies)
        .filter(movie => 
          movie.backdrop_path && 
          movie.vote_average > 6.5 && // Solo películas bien valoradas
          movie.overview && 
          movie.title &&
          movie.release_date &&
          movie.overview.length > 50 // Asegurar que tiene descripción decente
        )
        .slice(0, 15) // Aumentar a 15 películas para más variedad
        .map(movie => ({
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          backdrop: getFullImageUrl(movie.backdrop_path, 'original'),
          releaseDate: movie.release_date,
          rating: movie.vote_average,
          genre: movie.genre_ids?.[0] || null,
          popularity: movie.popularity || 0
        }));

      console.log(`Cargadas ${this.backgroundImages.length} películas para backgrounds dinámicos`);
      
      // Precargar todas las imágenes de fondo
      this.preloadAllImages();
    } catch (error) {
      console.error('Error cargando películas recientes:', error);
      throw error;
    }
  }

  createMovieInfoElement() {
    // Verificar si ya existe un elemento de información de película
    const existingInfo = this.heroElement.querySelector('.hero__movie-info');
    if (existingInfo) {
      existingInfo.remove();
    }
    
    // Crear elemento de información de película
    this.movieInfo = document.createElement('div');
    this.movieInfo.className = 'hero__movie-info';
    this.movieInfo.innerHTML = `
      <div class="movie-info__content">
        <h3 class="movie-info__title"></h3>
        <p class="movie-info__overview"></p>
        <div class="movie-info__meta">
          <span class="movie-info__year"></span>
          <span class="movie-info__rating"></span>
        </div>
      </div>
    `;
    
    // Insertar después del contenido principal del hero
    const heroContent = this.heroElement.querySelector('.hero__content');
    if (heroContent) {
      heroContent.appendChild(this.movieInfo);
    } else {
      this.heroElement.appendChild(this.movieInfo);
    }
    
    // En móviles, mostrar inmediatamente la información
    this.checkResponsiveLayout();
    window.addEventListener('resize', () => this.checkResponsiveLayout());
  }

  checkResponsiveLayout() {
    if (!this.movieInfo) return;
    
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024;
    
    if (isMobile) {
      // En móviles, mostrar siempre la información y mover al content
      this.movieInfo.classList.add('hero__movie-info--visible');
      const heroContent = this.heroElement.querySelector('.hero__content');
      if (heroContent && !heroContent.contains(this.movieInfo)) {
        heroContent.appendChild(this.movieInfo);
      }
    } else if (isTablet) {
      // En tablets, ocultar completamente para no interferir con el contenido
      this.movieInfo.classList.remove('hero__movie-info--visible');
      if (this.heroElement.contains(this.movieInfo) && !this.heroElement.querySelector('.hero__content').contains(this.movieInfo)) {
        this.heroElement.appendChild(this.movieInfo);
      }
    } else {
      // En desktop, usar la lógica normal de animación y posición absoluta en el lado izquierdo
      this.movieInfo.classList.remove('hero__movie-info--visible');
      if (this.heroElement.contains(this.movieInfo) && this.heroElement.querySelector('.hero__content').contains(this.movieInfo)) {
        this.heroElement.appendChild(this.movieInfo);
      }
    }
  }

  setupBackgroundRotation() {
    if (!this.backgroundImages.length) return;

    // Precargar la primera imagen
    this.preloadImage(this.backgroundImages[0].backdrop);
    
    // Inicializar con la primera película
    this.currentIndex = 0;
    this.updateBackground(0);
    this.updateMovieInfo(0);
  }

  updateBackground(index) {
    if (this.isTransitioning || !this.backgroundImages[index]) return;
    
    this.isTransitioning = true;
    const movie = this.backgroundImages[index];
    
    // Actualizar el índice actual ANTES de cambiar el background
    this.currentIndex = index;
    
    // Crear nuevo elemento de background
    const newBackground = document.createElement('div');
    newBackground.className = 'hero__dynamic-background';
    newBackground.style.backgroundImage = `
      linear-gradient(100deg, rgba(0,0,0,.88) 0%, rgba(0,0,0,.3) 60%),
      url(${movie.backdrop})
    `;
    
    // Insertar el nuevo background
    this.heroElement.appendChild(newBackground);
    
    // Agregar clase para fallback CSS
    this.heroElement.classList.add('has-dynamic-background');
    
    // Animar entrada
    requestAnimationFrame(() => {
      newBackground.classList.add('hero__dynamic-background--active');
      
      // Remover background anterior después de la transición
      setTimeout(() => {
        const oldBackgrounds = this.heroElement.querySelectorAll('.hero__dynamic-background:not(.hero__dynamic-background--active)');
        oldBackgrounds.forEach(bg => bg.remove());
        this.isTransitioning = false;
      }, 1000);
    });

    // Actualizar información de película DESPUÉS de cambiar el background
    setTimeout(() => {
      this.updateMovieInfo(index);
    }, 100);
    
    // Precargar siguiente imagen
    const nextIndex = (index + 1) % this.backgroundImages.length;
    this.preloadImage(this.backgroundImages[nextIndex].backdrop);
  }

  updateMovieInfo(index) {
    const movie = this.backgroundImages[index];
    if (!movie || !this.movieInfo) return;

    console.log(`Actualizando información de película: ${movie.title} (índice: ${index})`);

    const title = this.movieInfo.querySelector('.movie-info__title');
    const overview = this.movieInfo.querySelector('.movie-info__overview');
    const year = this.movieInfo.querySelector('.movie-info__year');
    const rating = this.movieInfo.querySelector('.movie-info__rating');

    if (title) title.textContent = movie.title;
    if (overview) overview.textContent = this.truncateText(movie.overview, 140);
    if (year) year.textContent = movie.releaseDate?.split('-')[0] || '';
    if (rating) rating.innerHTML = `<i class="fas fa-star"></i> ${movie.rating.toFixed(1)}`;

    // Animar entrada de la información solo en desktop grande
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024;
    
    if (!isMobile && !isTablet) {
      this.movieInfo.classList.remove('hero__movie-info--visible');
      setTimeout(() => {
        this.movieInfo.classList.add('hero__movie-info--visible');
      }, 500);
    }
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  preloadImage(src) {
    const img = new Image();
    img.src = src;
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    });
  }

  async preloadAllImages() {
    console.log('Precargando imágenes de fondo...');
    const imagePromises = this.backgroundImages.map(movie => 
      this.preloadImage(movie.backdrop).catch(error => {
        console.warn(`Error precargando imagen de ${movie.title}:`, error);
        return null;
      })
    );
    
    try {
      await Promise.all(imagePromises);
      console.log('Todas las imágenes precargadas exitosamente');
    } catch (error) {
      console.warn('Algunas imágenes no pudieron precargarse:', error);
    }
  }

  startRotation() {
    if (!this.backgroundImages.length) return;

    this.intervalId = setInterval(() => {
      const nextIndex = (this.currentIndex + 1) % this.backgroundImages.length;
      this.updateBackground(nextIndex);
    }, this.rotationInterval);
  }

  stopRotation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  pauseRotation() {
    this.stopRotation();
  }

  resumeRotation() {
    if (!this.intervalId) {
      this.startRotation();
    }
  }

  nextBackground() {
    const nextIndex = (this.currentIndex + 1) % this.backgroundImages.length;
    this.updateBackground(nextIndex);
  }

  prevBackground() {
    const prevIndex = this.currentIndex === 0 ? this.backgroundImages.length - 1 : this.currentIndex - 1;
    this.updateBackground(prevIndex);
  }

  createNavigationControls() {
    this.navControls = document.createElement('div');
    this.navControls.className = 'hero__nav-controls';
    this.navControls.innerHTML = `
      <button class="hero__nav-btn" id="heroPrevBtn" aria-label="Imagen anterior">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button class="hero__nav-btn" id="heroNextBtn" aria-label="Siguiente imagen">
        <i class="fas fa-chevron-right"></i>
      </button>
      <button class="hero__nav-btn" id="heroPlayPauseBtn" aria-label="Pausar/Reproducir">
        <i class="fas fa-pause"></i>
      </button>
    `;

    this.heroElement.appendChild(this.navControls);

    // Event listeners
    const prevBtn = this.navControls.querySelector('#heroPrevBtn');
    const nextBtn = this.navControls.querySelector('#heroNextBtn');
    const playPauseBtn = this.navControls.querySelector('#heroPlayPauseBtn');

    prevBtn.addEventListener('click', () => this.prevBackground());
    nextBtn.addEventListener('click', () => this.nextBackground());
    playPauseBtn.addEventListener('click', () => this.toggleRotation());

    // Pausar al hacer hover sobre el hero
    this.heroElement.addEventListener('mouseenter', () => this.pauseRotation());
    this.heroElement.addEventListener('mouseleave', () => this.resumeRotation());
  }

  toggleRotation() {
    const playPauseBtn = this.navControls.querySelector('#heroPlayPauseBtn i');
    if (this.intervalId) {
      this.pauseRotation();
      playPauseBtn.className = 'fas fa-play';
    } else {
      this.resumeRotation();
      playPauseBtn.className = 'fas fa-pause';
    }
  }

  fallbackToStaticBackground() {
    console.log('Usando background estático como fallback');
    // El CSS ya tiene el background estático configurado
  }

  destroy() {
    this.stopRotation();
    
    // Limpiar backgrounds dinámicos
    const dynamicBackgrounds = this.heroElement.querySelectorAll('.hero__dynamic-background');
    dynamicBackgrounds.forEach(bg => bg.remove());
    
    // Remover clase fallback
    this.heroElement.classList.remove('has-dynamic-background');
    
    // Limpiar información de película
    const movieInfos = this.heroElement.querySelectorAll('.hero__movie-info');
    movieInfos.forEach(info => info.remove());
    
    // Limpiar controles de navegación
    const navControls = this.heroElement.querySelectorAll('.hero__nav-controls');
    navControls.forEach(control => control.remove());
    
    // Resetear propiedades
    this.movieInfo = null;
    this.navControls = null;
    this.backgroundImages = [];
    this.currentIndex = 0;
    this.isTransitioning = false;
  }
}

// Instancia global
let heroBackgroundManager = null;

export function initializeHeroBackground() {
  if (heroBackgroundManager) {
    heroBackgroundManager.destroy();
  }
  
  heroBackgroundManager = new HeroBackgroundManager();
  heroBackgroundManager.initialize();
  
  return heroBackgroundManager;
}

export function getHeroBackgroundManager() {
  return heroBackgroundManager;
}

export { HeroBackgroundManager };