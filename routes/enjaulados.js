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

        // Recorrer los datos de Firebase
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

        const fechaActualStr = fecha(); // Usa tu función de fecha personalizada
        const [diaActual, mesActual, añoActual] = fechaActualStr.split('-');
        const fechaActualDate = new Date(`${añoActual}-${mesActual}-${diaActual}`); // Convertir a objeto Date

        const animalDiasSinSalir = Object.keys(animalFechas).map((numero) => {
            // Ordenar las fechas de manera descendente
            const fechasOrdenadas = animalFechas[numero].sort((a, b) => {
                const [diaA, mesA, añoA] = a.split('-');
                const [diaB, mesB, añoB] = b.split('-');
                return new Date(`${añoB}-${mesB}-${diaB}`) - new Date(`${añoA}-${mesA}-${diaA}`);
            });

            const ultimaFecha = fechasOrdenadas[0]; // Última fecha de salida del animal

            // Convertir la última fecha a un objeto Date para hacer la comparación
            const [diaUlt, mesUlt, añoUlt] = ultimaFecha.split('-');
            const ultimaFechaDate = new Date(`${añoUlt}-${mesUlt}-${diaUlt}`);

            // Calcular los días desde la última vez que salió hasta hoy
            const diasSinSalir = Math.floor((fechaActualDate - ultimaFechaDate) / (1000 * 60 * 60 * 24));

            return {
                numero,
                animal: animalInfo[numero].animal,
                imagenURL: animalInfo[numero].imagenURL,
                numeroAnimal: animalInfo[numero].numero,
                ultimaFecha: ultimaFecha, // Mantener la fecha en su formato original
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
