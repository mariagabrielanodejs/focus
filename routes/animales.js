const axios = require('axios');
const cheerio = require('cheerio');
const imagenesLotto = require('./imagenesAnimalitos');

const busquedaAnimales = async () => {
  try {
    const response = await axios.get('https://m.parley.la/resultados/resultados-lotto-activo');
    const $ = cheerio.load(response.data);
    const resultados = [];
    $('.text-center.ui-content.ui-body-b.bordes_simple:not(.box-share-btn)').each((index, element) => {
      let textoCompleto = $(element).text().trim();
      textoCompleto = textoCompleto.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
      resultados.push(textoCompleto);
    });
    let regex = /Lotto Activo (\d{2}:\d{2} (am|pm)) Fecha: (\d{2}-\d{2}-\d{4}) (\d{2}) ([A-Za-z]+)/;
    let resultadoDesglosado = resultados.map(texto => {
      let match = texto.match(regex);
      if (match) {
        const numero = match[4];
        const imagenURL = imagenesLotto[numero];
        return {
          Titulo: "Lotto Activo",
          Hora: match[1],
          Fecha: match[3],
          Numero: match[4],
          Animal: match[5],
          ImagenURL: imagenURL
        };
      } else {
        return null;
      }
    }).filter(item => item !== null);  
    return resultadoDesglosado;
  } catch (error) {
    throw new Error('Error en el fetch data');
  }
}

module.exports = busquedaAnimales;
