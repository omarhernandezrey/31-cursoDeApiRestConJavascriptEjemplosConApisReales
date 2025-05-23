# curso-api-rest-javascript-practico
Curso Práctico de Consumo de API REST con JavaScript
Aquí tienes el archivo `README.md` completo y actualizado, listo para copiar, guardar o subir a tu repositorio:

---

### ✅ `README.md`

```markdown
# 🎬 CineXpress

Aplicación web de películas construida con **HTML, CSS y JavaScript** que consume la API de [The Movie Database (TMDB)](https://www.themoviedb.org/).  
Permite explorar películas en tendencia, por categoría, ver detalles, reparto y tráileres.

---

## 🚀 Funcionalidades

- Buscar películas por nombre
- Ver tendencias actuales
- Explorar por categorías
- Ver detalles de una película
- Ver reparto principal y películas similares
- Ver tráiler (si está disponible)
- Tema oscuro/claro
- Diseño responsive

---

## 📦 Estructura del proyecto

```

31-cursoDeApiRestConJavascriptEjemplosConApisReales/
├── index.html
├── .gitignore
├── README.md
├── src/
│   ├── css/          → Estilos CSS organizados
│   ├── img/          → Imágenes del sitio
│   └── js/           → Módulos JavaScript
│       ├── config.js           → Configuración API (auto detecta entorno)
│       ├── config.local.js     → (Ignorado en Git) Clave real para local
│       ├── api.js              → Funciones para consumir la API TMDB
│       ├── dom.js              → Generación y renderizado dinámico
│       ├── navigation.js       → SPA y navegación por hash
│       ├── main.js             → Punto de entrada principal
│       ├── trailerModal.js     → Modal para ver tráiler
│       └── theme.js            → Cambio de tema

````

---

## 🔑 Configuración de la clave API

### `src/js/config.js`

Detecta si estás en `localhost` y usa tu clave automáticamente. En producción puedes dejar la clave vacía o visible si no te preocupa que se exponga:

```js
const LOCAL_KEY = 'TU_API_KEY_AQUI';

export const API_KEY = window.location.hostname === 'localhost'
  ? LOCAL_KEY
  : ''; // ← puedes poner la clave aquí también si es necesario

export const BASE_URL = 'https://api.themoviedb.org/3/';
export const IMG_BASE_URL = 'https://image.tmdb.org/t/p/';
export const DEFAULT_LANGUAGE = 'es-ES';
````

### `src/js/config.local.js`

Este archivo contiene tu clave **solo en local** y está **ignorado en Git**. Úsalo para pruebas o respaldos futuros, pero **no lo cargues en HTML**.

```js
export const API_KEY = 'TU_API_KEY_REAL';
```

---

## 🧑‍💻 Desarrollo local

1. Clona el repositorio
2. Crea `src/js/config.local.js` si quieres mantener una clave separada
3. Abre `index.html` directamente en el navegador

---

## ☁️ Despliegue en Vercel

1. Sube el repositorio a GitHub
2. Ve a [vercel.com/import](https://vercel.com/import) e importa tu repo
3. Vercel detectará que es un proyecto estático (HTML/JS/CSS)
4. Haz clic en **Deploy**
5. ✅ ¡Listo!

---

## 📝 Licencia

Este proyecto se distribuye bajo la licencia [MIT](LICENSE).

```

---

¿Deseas que agregue también una sección de “Próximas mejoras” o instrucciones para colaboradores?
```
# 🎬 CineXpress

![Vista previa de CineXpress en iPhone SE](src/img/screenshot.png)

Aplicación web de películas construida con **HTML, CSS y JavaScript** que consume la API de [The Movie Database (TMDB)](https://www.themoviedb.org/).
