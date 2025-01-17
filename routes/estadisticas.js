const db = require('./firebase');
const { ref, push, query, get, } = require('firebase/database');

module.exports = async function contarNumeros() {
try {
    const dataRef = ref(db, 'resultados'); // Ruta correcta de los resultados
    const snapshot = await get(query(dataRef));

    if (snapshot.exists()) {
      const data = snapshot.val(); // Todos los datos desde Firebase

      // Objetos para contar las ocurrencias de cada número y almacenar información adicional
      let numeroCount = {};
      let animalInfo = {}; // Almacenaremos el nombre, la imagen y las fechas

      Object.values(data).forEach((fecha) => {
        fecha.resultados.forEach((resultado) => {
          const numero = resultado.numero;
          const fechaActual = fecha.fecha;
          // Si el número ya existe en el objeto, incrementamos su cuenta y añadimos la fecha
          if (numeroCount[numero]) {
            numeroCount[numero]++;
            animalInfo[numero].fechas.push(fechaActual);
          } else {
            // Si no existe, lo agregamos al objeto con una cuenta inicial de 1
            numeroCount[numero] = 1;
            animalInfo[numero] = {
              animal: resultado.animal,
              imagenURL: resultado.imagenURL,
              fechas: [fechaActual], // Inicializamos con la primera fecha
            };
          }
        });
      });

      // Crear un array con las estadísticas
      const estadisticas = Object.keys(numeroCount).map((numero,index) => {
        return {
          index,
          numero,
          count: numeroCount[numero],
          animal: animalInfo[numero].animal, // Nombre del animal
          imagenURL: animalInfo[numero].imagenURL, // Imagen del animal
          fechas: animalInfo[numero].fechas, // Fechas en las que salió el número
        };
      });

      estadisticas.sort((a, b) => b.count - a.count);
      return estadisticas;
    } else {
      console.log('No se encontraron datos.');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    return [];
  }  
};


