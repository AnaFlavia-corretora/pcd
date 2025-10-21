let slideIndex = 0;
let slides, thumbs; // Estas variáveis serão inicializadas pelo detalhes-imovel.js

/**
 * Exibe o slide do carrossel correspondente ao índice `n`.
 * Atualiza a visibilidade da imagem principal e a classe 'active' da miniatura.
 * @param {number} n - O índice do slide a ser exibido.
 */
function showSlide(n) {
  // Verifica se 'slides' foi inicializado e não está vazio para evitar erros
  if (!slides || slides.length === 0) {
    console.warn("Slides não inicializados ou vazios em showSlide.");
    return;
  }

  slides.forEach((img, index) => {
    img.style.display = index === n ? "block" : "none"; // Mostra ou esconde a imagem principal
  });

  // Verifica se 'thumbs' foi inicializado e não está vazio antes de tentar acessá-lo
  if (thumbs && thumbs.length > 0) {
    thumbs.forEach((thumb, index) => {
      // Adiciona ou remove a classe 'active' para destacar a miniatura atual
      thumb.classList.toggle("active", index === n);
    });
  }
}

/**
 * Avança para o próximo slide no carrossel.
 */
function nextSlide() {
  if (!slides || slides.length === 0) return;
  slideIndex = (slideIndex + 1) % slides.length; // Calcula o próximo índice (loop)
  showSlide(slideIndex); // Exibe o próximo slide
}

/**
 * Volta para o slide anterior no carrossel.
 */
function prevSlide() {
  if (!slides || slides.length === 0) return;
  slideIndex = (slideIndex - 1 + slides.length) % slides.length; // Calcula o índice anterior (loop)
  showSlide(slideIndex); // Exibe o slide anterior
}

/**
 * Define o slide atual do carrossel para o índice `n`.
 * @param {number} n - O índice do slide a ser definido como atual.
 */
function setSlide(n) {
  if (!slides || slides.length === 0) return;
  slideIndex = n; // Define o índice do slide
  showSlide(slideIndex); // Exibe o slide
}

// Lightbox (imagem ampliada)
let lightboxImages = []; // Esta variável será preenchida dinamicamente
let currentLightboxIndex = 0;

/**
 * Abre o lightbox com a imagem ampliada.
 * Popula 'lightboxImages' no momento da abertura para garantir que as URLs estejam corretas.
 * @param {number} index - O índice da imagem a ser ampliada no carrossel.
 */
function openLightbox(index) {
  // CRUCIAL: Popula lightboxImages AQUI para garantir que ele contenha as imagens
  // atualmente presentes no carrossel (que são adicionadas dinamicamente pelo detalhes-imovel.js).
  lightboxImages = Array.from(
    document.querySelectorAll("#detalhe-carousel img.main")
  );

  console.log("openLightbox chamada com índice:", index);
  console.log("Array lightboxImages:", lightboxImages);

  // Verifica se a imagem existe no array antes de tentar acessá-la
  if (lightboxImages.length === 0 || !lightboxImages[index]) {
    console.error(
      "Nenhuma imagem para lightbox encontrada para o índice:",
      index
    );
    return; // Sai da função se não houver imagem
  }

  const imageUrl = lightboxImages[index].src; // Obtém a URL da imagem
  document.getElementById("lightbox-img").src = imageUrl; // Define a URL da imagem no lightbox
  document.getElementById("lightbox").style.display = "flex"; // Exibe o lightbox
  console.log("Definindo src da imagem do lightbox para:", imageUrl);
}

/**
 * Fecha o lightbox.
 */
function closeLightbox() {
  document.getElementById("lightbox").style.display = "none"; // Oculta o lightbox
}

/**
 * Navega para a próxima imagem no lightbox.
 */
function nextLightbox() {
  if (lightboxImages.length === 0) return;
  currentLightboxIndex = (currentLightboxIndex + 1) % lightboxImages.length; // Próximo índice (loop)
  document.getElementById("lightbox-img").src =
    lightboxImages[currentLightboxIndex].src; // Atualiza a imagem do lightbox
}

/**
 * Navega para a imagem anterior no lightbox.
 */
function prevLightbox() {
  if (lightboxImages.length === 0) return;
  currentLightboxIndex =
    (currentLightboxIndex - 1 + lightboxImages.length) % lightboxImages.length; // Índice anterior (loop)
  document.getElementById("lightbox-img").src =
    lightboxImages[currentLightboxIndex].src; // Atualiza a imagem do lightbox
}

// O listener DOMContentLoaded original do script.js não é mais necessário
// para inicializar slides/thumbs, pois detalhes-imovel.js fará isso APÓS carregar o conteúdo.
// No entanto, é importante que este script seja carregado DEPOIS do detalhes-imovel.js
// na página de detalhes para que as funções globais (openLightbox, etc.) estejam disponíveis.
// A inicialização de slides e thumbs para o carrossel é feita em detalhes-imovel.js.
// A lógica de tornar as imagens clicáveis para o lightbox é integrada no detalhes-imovel.js
// ao criar as imagens do carrossel.
