# Focus  

**Focus** es un proyecto desarrollado en Node.js que obtiene datos actualizados de Lotto Activo (animalitos) mediante web scraping. Utiliza tecnologías y librerías modernas para ofrecer una solución eficiente y escalable.  

## 🛠️ Tecnologías utilizadas  
- **Node.js**  
- **Express**  
- **Axios**: Para realizar solicitudes HTTP.  
- **Cheerio**: Para extraer y manipular datos del HTML obtenido mediante web scraping.  

## 🕧 Explicación del código para buscar los resultados en tiempo real

Este código realiza web scraping para obtener los resultados de Lotto Activo (animalitos) en tiempo real utilizando las librerías `axios` y `cheerio`. A continuación, se explica cada parte del proceso.

---

## 1. **Función Asíncrona `busquedaAnimales`**

La función utiliza `axios` para realizar una solicitud HTTP al sitio de resultados y `cheerio` para extraer datos específicos del HTML recibido.

```javascript
const busquedaAnimales = async () => {
  try {
    const response = await axios.get('https://m.parley.la/resultados/resultados-lotto-activo');
    const $ = cheerio.load(response.data);
    ...
  } catch (error) {
    throw new Error('Error en el fetch data');
  }
};
```
## 2. **Solicitud HTTP**
```javascript
const response = await axios.get('https://m.parley.la/resultados/resultados-lotto-activo');
```
- **axios.get:** Realiza una solicitud GET a la URL que contiene los resultados.
- **response.data:** Contiene el contenido HTML de la página.

## 3. **Carga del HTML con cheerio**
```javascript
const $ = cheerio.load(response.data);
```
- **cheerio.load:** Permite manipular el HTML de manera similar a jQuery, seleccionando elementos específicos del DOM.

## 4. **Extracción de Datos**
```javascript
const resultados = [];
$('.text-center.ui-content.ui-body-b.bordes_simple:not(.box-share-btn)').each((index, element) => {
  let textoCompleto = $(element).text().trim();
  textoCompleto = textoCompleto.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  resultados.push(textoCompleto);
});
```
- **$('.selector'):** Selecciona elementos HTML relevantes, ejemplo: **.text-center.ui-content.ui-body-b.bordes_simple:not(.box-share-btn)**
- **$(element).text():** Extrae el texto del elemento HTML.
- **replace y trim:** Limpian el texto eliminando espacios y saltos de línea innecesarios.
- **resultados.push:** Agrega cada resultado limpio al array resultados.

## 5. **Desglose y Formateo de Resultados**

```javascript
let regex = /Lotto Activo (\d{2}:\d{2} (am|pm)) Fecha: (\d{2}-\d{2}-\d{4}) (\d{2}) ([A-Za-z]+)/;
let resultadoDesglosado = resultados.map(texto => {
  let match = texto.match(regex);
  if (match) {
    const numero = match[4];
    const imagenURL = imagenesLotto[numero];
    return {
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
```
- **Expresion Regular(regex)**:
    - Captura datos relevantes como la hora, fecha, número y animal(01:30 pm Fecha: 25-12-2024 12 Gallo".).
    - Grupos capturados:
        - Hora: (\d{2}:\d{2} (am|pm)).
        - Fecha: (\d{2}-\d{2}-\d{4}).
        - Número: (\d{2}).
        - Animal: ([A-Za-z]+).
    - map:
        - Aplica la expresión regular a cada elemento del array resultados.
        - Si hay coincidencia:
            - Extrae la información (hora, fecha, número, animal).
            - Busca la URL de la imagen correspondiente al número.
            - Devuelve un objeto formateado.
    - filter:
        - Elimina los elementos que no coincidan con el patrón.

## 6. **Manejo de errores**

```javascript
catch (error) {
throw new Error('Error en el fetch data');
}
```
- Si ocurre un **error** durante la solicitud o el procesamiento, lanza un mensaje indicando el problema.

## 6. **Resultado Final**

**Codigo completo:**

```javascript

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

```

**La función devuelve un array de objetos con el siguiente formato:**
```javascript
[
  {
    Hora: "01:30 pm",
    Fecha: "25-12-2024",
    Numero: "12",
    Animal: "Gallo",
    ImagenURL: "https://url-de-la-imagen-del-gallo"
  },
  ...
]
```
## **¿Cómo funciona en tiempo real?:**
- Al ejecutar la función, se realiza una solicitud al sitio web para obtener los datos más recientes disponibles.

## 🚀 Instalación y configuración  

Sigue estos pasos para clonar e iniciar el proyecto en tu máquina local:  

1. Clona el repositorio:  
   ```bash
   git clone https://github.com/mariagabrielanodejs/focus
   cd focus
   ```

2. Instala las dependencias:
    ```bash
   npm install
   ```
2. Inicia el servidor:
    ```bash
   npm start
   ```

