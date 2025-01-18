var express = require('express');
var router = express.Router();
const busquedaAnimales = require('./animales');
const combinacionesAnimales = require('./combinacionAnimalitos');
const imagenesLotto = require('./imagenesAnimalitos');
const db = require('./firebase');
const { ref, push, query, get, } = require('firebase/database');
const estadisticasAnimalitos = require('./estadisticas');
const enjauladosAnimalitos = require('./enjaulados');





  const fecha = () => {
    let date = new Date();
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

router.get('/', async (req, res) => {
  try {
    const fechaActual = fecha();
    const resultados = await busquedaAnimales();

    // Validar si hay resultados
    if (!resultados || resultados.length === 0) {
      return res.render('resultados', {
        resultados: [],
        animalesConImagenes: [],
        nuevaHora: '',
        ultimoNumeroAnimalitoImagen: ''
      });
    }

    let ultimoResultado = resultados[resultados.length - 1];

    if (!ultimoResultado.Numero) {
      return res.status(500).send('No se encontró el número en el último resultado');
    }

    let ultimoNumeroAnimalito = ultimoResultado.Numero;
    let posiblesAnimales = combinacionesAnimales[ultimoNumeroAnimalito];
    let ultimoNumeroAnimalitoImagen = imagenesLotto[ultimoNumeroAnimalito];

    let animalesConImagenes = posiblesAnimales.map(numero => {
      return {
        numero: numero,
        imagenURL: imagenesLotto[numero] || 'Imagen no encontrada'
      };
    });

    let ultimaHora = ultimoResultado.Hora;
    let [hora, minuto] = ultimaHora.split(':');
    let [horaNum, ampm] = hora.split(' ');
    horaNum = parseInt(horaNum);

    // Ajustar las horas a formato 24 horas
    if (ampm === 'pm' && horaNum < 12) horaNum += 12;
    if (ampm === 'am' && horaNum === 12) horaNum = 0;

    // Crear un objeto Date y sumar una hora
    let fechaHora = new Date();
    fechaHora.setHours(horaNum);
    fechaHora.setMinutes(parseInt(minuto));
    fechaHora.setSeconds(0);
    fechaHora.setHours(fechaHora.getHours() + 1);

    // Convertir la hora nuevamente a formato 12 horas
    let nuevaHoraNum = fechaHora.getHours();
    let nuevaMinuto = fechaHora.getMinutes();
    let nuevoAMPM = nuevaHoraNum >= 12 ? 'pm' : 'am';
    nuevaHoraNum = nuevaHoraNum % 12;
    nuevaHoraNum = nuevaHoraNum ? nuevaHoraNum : 12; // Si es 0, se convierte en 12

    // Formatear la nueva hora
    let nuevaHora = `${nuevaHoraNum}:${nuevaMinuto < 10 ? '0' : ''}${nuevaMinuto} ${nuevoAMPM}`;


    const referenciaResultados = ref(db, 'resultados');
    const snapshot = await get(referenciaResultados);
    let existeFecha = false;
    if (snapshot.exists()) {
      const datos = snapshot.val();
      for (const key in datos) {
        if (datos[key].fecha === fechaActual) {
          existeFecha = true;
          break;
        }
      }
    }

    if (!existeFecha && resultados.length == 12) {
      const datosAGuardar = resultados.map((resultado, index) => ({
        numero: resultado.Numero,
        animal: resultado.Animal,
        imagenURL: resultado.ImagenURL,
        fecha: resultado.Fecha,
        hora: resultado.Hora
      }));

      const fechaActualAnimalito = datosAGuardar.length > 0 ? datosAGuardar[0].fecha : null;
      await push(referenciaResultados, {
        fecha: fechaActualAnimalito,
        resultados: datosAGuardar
      });

      console.log('Resultados guardados exitosamente.');
    } else if (existeFecha) {
      console.log('Ya existe una entrada con la misma fecha. No se guardaron datos.');
    }

    res.render('resultados', { resultados, animalesConImagenes, nuevaHora, ultimoNumeroAnimalitoImagen });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error while fetching data');
  }
});




router.get('/resultadosporfecha', async (req, res) => {
  try {
    const fechaActual = fecha();
    const fechaBusqueda = fechaActual;
    const referenciaResultados = ref(db, 'resultados');
    const snapshot = await get(referenciaResultados);
    if (!snapshot.exists()) {
      return res.status(404).send('No se encontraron resultados en la base de datos.');
    }
    const datos = snapshot.val();
    let resultadosFecha = null;
    for (const key in datos) {
      if (datos[key].fecha === fechaBusqueda) {
        resultadosFecha = datos[key];
        break;
      }
    }

    if (!resultadosFecha) {
      resultadosFecha = { resultados: [] };
    }

    res.render('resultadosporfecha', {
      resultados: resultadosFecha.resultados || [],
      fecha: resultadosFecha.fecha
    });
  } catch (error) {
    console.log(error)
  }
});


router.post('/resultadosporfecha', async (req, res) => {
  try {
    const fechaInput = req.body.fecha;
    const convertirFecha = (fecha) => {
      const [year, month, day] = fecha.split('-');
      return `${day}-${month}-${year}`;
    };

    let fechaBusquedaAnimal = '';
    if (fechaInput.trim() !== '') {
      fechaBusquedaAnimal = convertirFecha(fechaInput);
    }

    console.log('Fecha de hoy: ', fechaBusquedaAnimal);

    const referenciaResultados = ref(db, 'resultados');
    const snapshot = await get(referenciaResultados);
    if (!snapshot.exists()) {
      return res.status(404).send('No se encontraron resultados en la base de datos.');
    }
    const datos = snapshot.val();
    let resultadosFecha = null;
    for (const key in datos) {
      if (datos[key].fecha === fechaBusquedaAnimal) {
        resultadosFecha = datos[key];
        break;
      }
    }

    if (!resultadosFecha) {
      resultadosFecha = { resultados: [] };
    }

    res.render('resultadosporfecha', {
      resultados: resultadosFecha.resultados || [],
      fecha: resultadosFecha.fecha
    });
  } catch (error) {
    console.log(error)
  }
})



router.get('/estadisticas', async (req, res) => {
  const estadisticas = await estadisticasAnimalitos();
  res.render('estadisticas', { estadisticas });
});


router.get('/enjaulados', async(req,res) => {
  const animalDiasSinSalir = await enjauladosAnimalitos();
  res.render('enjaulados', { animalDiasSinSalir })
})






module.exports = router;
