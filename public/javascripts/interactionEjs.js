function openModal() {
    const modal = document.getElementById('animalModal'); // Asignar modal a la variable
    modal.classList.add('show'); // Mostrar el modal
  }

  // Función para cerrar el modal
  function closeModal() {
    const modal = document.getElementById('animalModal'); // Asignar modal a la variable
    modal.classList.remove('show'); // Eliminar la clase 'show' para cerrar el modal
  }


  function toggleMode() {
    const body = document.body;
    const h1 = document.querySelector('h1');
    const cards = document.querySelectorAll('.card');
    const cardTexts = document.querySelectorAll('.card .text-gray-400');
    const cardDateNumberTime = document.querySelectorAll('.card .text-gray-400, .card .text-lg');
    const modal = document.getElementById('animalModal');
    const modalContent = document.getElementById('modalContent');
    const title = document.getElementById('title');
    
    // Elementos del botón
    const toggleButton = document.getElementById('toggleButton');
    const modeText = document.getElementById('modeText');
    const iconMode = document.getElementById('iconMode');
  
    // Cambiar entre modo claro y oscuro
    body.classList.toggle("bg-gray-900");
    body.classList.toggle("bg-white");
    body.classList.toggle("text-gray-100");
    body.classList.toggle("text-gray-900");
    body.classList.toggle("shadow-none");
  
    modal.classList.toggle("dark-mode");
    modal.classList.toggle("light-mode");
  
    h1.classList.toggle("text-white");
    h1.classList.toggle("text-black");
  
    cards.forEach(card => {
      card.classList.toggle("bg-gray-800");
      card.classList.toggle("bg-white");
      card.classList.toggle("shadow-xl");
    });
  
    cardTexts.forEach(text => {
      text.classList.toggle("text-gray-400");
      text.classList.toggle("text-gray-900");
    });
  
    cardDateNumberTime.forEach(text => {
      text.classList.toggle("text-white");
      text.classList.toggle("text-gray-900");
    });
  
    if (body.classList.contains("bg-gray-900")) {
      title.classList.add("text-white");
      title.classList.remove("text-black");
  
      modeText.textContent = "Modo oscuro";
      iconMode.classList.remove("fa-sun");
      iconMode.classList.remove("text-yellow-300")
      iconMode.classList.add("fa-moon");
      modeText.classList.remove("text-black");
      modeText.classList.add("text-white");
      

  
    } else {
      title.classList.add("text-black");
      title.classList.remove("text-white");
  
      modeText.textContent = "Modo claro";
      iconMode.classList.remove("fa-moon");
      iconMode.classList.add("fa-sun");
      iconMode.classList.add("text-yellow-300");
      modeText.classList.add("text-black");
      modeText.classList.remove("text-white");

    }
  }
  
