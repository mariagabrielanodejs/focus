const db = require('./firebase');
const { ref, push, query, get, } = require('firebase/database');

module.exports = async function contarNumeros() {
    try {
      const dataRef = ref(db, 'resultados'); // Ruta correcta de los resultados
      const snapshot = await get(query(dataRef));
  
      if (snapshot.exists()) {
        const data = snapshot.val(); // Todos los datos desde Firebase
  
        // Creamos un objeto para contar las ocurrencias de cada número y almacenar nombre e imagen
        let numeroCount = {};
        let animalInfo = {}; // Almacenaremos el nombre y la imagen
  
        Object.values(data).forEach((fecha) => {
          fecha.resultados.forEach((resultado) => {
            const numero = resultado.numero;
  
            // Si el número ya existe en el objeto, incrementamos su cuenta
            if (numeroCount[numero]) {
              numeroCount[numero]++;
            } else {
              // Si no existe, lo agregamos al objeto con una cuenta inicial de 1
              numeroCount[numero] = 1;
            }
  
            // Almacenar la información del nombre y la imagen del animal
            if (!animalInfo[numero]) {
              animalInfo[numero] = {
                animal: resultado.animal,
                imagenURL: resultado.imagenURL
              };
            }
          });
        });
  
        // Crear un array con las estadísticas
        const estadisticas = Object.keys(numeroCount).map((numero) => {
          return {
            numero,
            count: numeroCount[numero],
            animal: animalInfo[numero].animal,  // Nombre del animal
            imagenURL: animalInfo[numero].imagenURL  // Imagen del animal
          };
        });
  
        console.log(estadisticas);
  
        // Ordenar las estadísticas de forma descendente
        estadisticas.sort((a, b) => b.count - a.count);
  
        return estadisticas; // Devuelve las estadísticas completas
      } else {
        console.log('No se encontraron datos.');
        return [];
      }
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      return [];
    }
  }
  
