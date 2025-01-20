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

router.get('/', async (req, res) => {
  try {
    const fechaActual = fecha();
    const resultados = await busquedaAnimales();

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
    let nuevaHora = ''
    if(ultimaHora  == '07:00 pm'){
      nuevaHora = '08:00 am'
    }
    else if(ultimaHora  == '08:00 am'){
      nuevaHora = '9:00 am'
    }
    else if(ultimaHora  == '09:00 am'){
      nuevaHora = '10:00 am'
    }
    else if(ultimaHora  == '10:00 am'){
      nuevaHora = '11:00 am'
    }
    else if(ultimaHora  == '11:00 am'){
      nuevaHora = '12:00 pm'
    }
    else if(ultimaHora  == '12:00 pm'){
      nuevaHora = '01:00 pm'
    }
    else if(ultimaHora  == '01:00 pm'){
      nuevaHora = '02:00 pm'

    }
    else if(ultimaHora  == '02:00 pm'){
      nuevaHora = '03:00 pm'
    }
    else if(ultimaHora  == '03:00 pm'){
      nuevaHora = '04:00 pm'
    }
    else if(ultimaHora  == '04:00 pm'){
      nuevaHora = '05:00 pm'
    }
    else if(ultimaHora  == '05:00 pm'){
      nuevaHora = '06:00 pm'
    }
    else if(ultimaHora  == '06:00 pm'){
      nuevaHora = '07:00 pm'
    }


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

      
      await push(referenciaResultados, {
        fecha: fechaActual,
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


router.get('/enjaulados', async (req, res) => {
  const animalDiasSinSalir = await enjauladosAnimalitos();
  res.render('enjaulados', { animalDiasSinSalir })
})


/*
const datosLotto = [
  {
      numero: "21",
      animal: "GALLO",
      fecha: "19-01-2025",
      hora: "08:00 am",
      imagenURL: "/images/21.png"
  },
  {
      numero: "0",
      animal: "DELFIN",
      fecha: "19-01-2025",
      hora: "09:00 am",
      imagenURL: "/images/0.png"
  },
  {
      numero: "19",
      animal: "CHIVO",
      fecha: "19-01-2025",
      hora: "10:00 am",
      imagenURL: "/images/19.png"
  },
  {
      numero: "21",
      animal: "GALLO",
      fecha: "19-01-2025",
      hora: "11:00 am",
      imagenURL: "/images/21.png"
  },
  {
      numero: "32",
      animal: "ARDILLA",
      fecha: "19-01-2025",
      hora: "12:00 pm",
      imagenURL: "/images/32.png"
  },
  {
      numero: "10",
      animal: "TIGRE",
      fecha: "19-01-2025",
      hora: "01:00 pm",
      imagenURL: "/images/10.png"
  },
  {
      numero: "10",
      animal: "TIGRE",
      fecha: "19-01-2025",
      hora: "02:00 pm",
      imagenURL: "/images/10.png"
  },
  {
      numero: "03",
      animal: "CIEMPIES",
      fecha: "19-01-2025",
      hora: "03:00 pm",
      imagenURL: "/images/03.png"
  },
  {
      numero: "25",
      animal: "GALLINA",
      fecha: "19-01-2025",
      hora: "04:00 pm",
      imagenURL: "/images/25.png"
  },
  {
      numero: "18",
      animal: "BURRO",
      fecha: "19-01-2025",
      hora: "05:00 pm",
      imagenURL: "/images/18.png"
  },
  {
      numero: "26",
      animal: "VACA",
      fecha: "19-01-2025",
      hora: "06:00 pm",
      imagenURL: "/images/26.png"
  },
  {
      numero: "33",
      animal: "PESCADO",
      fecha: "19-01-2025",
      hora: "07:00 pm",
      imagenURL: "/images/33.png"
  }
];


async function name() {
  const referenciaResultados = ref(db, 'resultados');
  await push(referenciaResultados, {
  fecha: "19-01-2025",
  resultados: datosLotto
});
}




name()

*/

module.exports = router;
