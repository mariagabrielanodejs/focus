const db = require('./firebase');
const { ref, push, query, get, } = require('firebase/database');


const busquedaAnimales = require('./animales');

const fecha = () => {
  let date = new Date().toLocaleString("en-US", { timeZone: "America/Caracas" });
  date = new Date(date); 

  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes.toString().padStart(2, '0');
  seconds = seconds.toString().padStart(2, '0');
  let day = date.getDate().toString().padStart(2, '0');
  let month = (date.getMonth() + 1).toString().padStart(2, '0');
  let year = date.getFullYear();
  let dateTime = `${day}-${month}-${year}`;
  return `${dateTime}`;
};



module.exports = async function enjaulados() {
  try {
    const dataRef = ref(db, 'resultados'); // Ruta correcta de los resultados
    const snapshot = await get(query(dataRef));

    if (snapshot.exists()) {
      const data = snapshot.val(); // Todos los datos desde Firebase

      let animalFechas = {}; // Almacenar las fechas de salida por animal
      let animalInfo = {}; // Almacenar información de los animales

      Object.values(data).forEach((fecha) => {
        fecha.resultados.forEach((resultado) => {
          const numero = resultado.numero;
          const fechaActual = fecha.fecha;

          // Almacenar las fechas de salida por animal
          if (!animalFechas[numero]) {
            animalFechas[numero] = [];
          }
          animalFechas[numero].push(fechaActual);

          // Almacenar información del animal (si no lo hemos hecho ya)
          if (!animalInfo[numero]) {
            animalInfo[numero] = {
              animal: resultado.animal,
              imagenURL: resultado.imagenURL,
              numero: resultado.numero
            };
          }
        });
      });

      const fechaActual = fecha();

      const animalDiasSinSalir = Object.keys(animalFechas).map((numero) => {
        const fechasOrdenadas = animalFechas[numero].sort((a, b) => new Date(b) - new Date(a));

        const ultimaFecha = fechasOrdenadas[0];

        const ultimaFechaDate = new Date(
          `${ultimaFecha.split('-')[1]}/${ultimaFecha.split('-')[0]}/${ultimaFecha.split('-')[2]}`
        );
        const fechaActualDate = new Date(
          `${fechaActual.split('-')[1]}/${fechaActual.split('-')[0]}/${fechaActual.split('-')[2]}`
        );

        const diasSinSalir = Math.floor((fechaActualDate - ultimaFechaDate) / (1000 * 60 * 60 * 24));

        return {
          numero,
          animal: animalInfo[numero].animal,
          imagenURL: animalInfo[numero].imagenURL,
          numeroAnimal: animalInfo[numero].numero,
          ultimaFecha: ultimaFecha,
          diasSinSalir: diasSinSalir
        };
      });

      // Ordenar por los días sin salir de forma descendente
      animalDiasSinSalir.sort((a, b) => b.diasSinSalir - a.diasSinSalir);
      return animalDiasSinSalir;
    } else {
      console.log('No se encontraron datos.');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    return [];
  }
}
