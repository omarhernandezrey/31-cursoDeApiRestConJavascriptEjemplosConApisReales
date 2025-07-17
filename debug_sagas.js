// Debug para sagas
const { getPopularSagas, getSagaMovies } = require('./src/js/api.js');

async function testSagas() {
  console.log('🔍 INICIANDO DEBUG DE SAGAS');
  
  try {
    // Obtener sagas populares
    const sagas = await getPopularSagas();
    console.log(`✅ Sagas obtenidas: ${sagas.length}`);
    
    // Mostrar primeras 5 sagas
    console.log('\n📋 PRIMERAS 5 SAGAS:');
    sagas.slice(0, 5).forEach((saga, index) => {
      console.log(`${index + 1}. ${saga.name} (ID: ${saga.id})`);
    });
    
    // Probar obtener películas de la primera saga
    console.log('\n🎬 PROBANDO PRIMERA SAGA:');
    const firstSaga = sagas[0];
    const sagaWithMovies = await getSagaMovies(firstSaga);
    console.log(`Saga: ${sagaWithMovies.name}`);
    console.log(`Películas encontradas: ${sagaWithMovies.movies?.length || 0}`);
    
    if (sagaWithMovies.movies?.length > 0) {
      console.log('Películas:', sagaWithMovies.movies.map(m => m.title));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSagas();