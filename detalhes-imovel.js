document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const imovelId = urlParams.get("id");

  if (!imovelId) {
    console.error("ID do imóvel não encontrado na URL.");
    document.getElementById("imovel-detalhes-container").innerHTML =
      "<p>Imóvel não encontrado. Por favor, retorne à página inicial.</p>";
    return;
  }

  fetch("imoveis.json")
    .then((res) => res.json())
    .then((imoveis) => {
      const imovel = imoveis.find((item) => item.id === imovelId);

      if (!imovel) {
        console.error("Imóvel com ID " + imovelId + " não encontrado.");
        document.getElementById("imovel-detalhes-container").innerHTML =
          "<p>Imóvel não encontrado. Por favor, retorne à página inicial.</p>";
        return;
      }

      // Preencher informações gerais
      document.getElementById("detalhe-titulo").textContent =
        imovel.titulo + " por " + imovel.valor;
      document.getElementById(
        "detalhe-localizacao"
      ).textContent = `${imovel.localizacao} - ${imovel.cidade}`;

      // Preencher carrossel de imagens
      const carouselContainer = document.getElementById("detalhe-carousel");
      const thumbnailsContainer = document.getElementById("detalhe-thumbnails");
      carouselContainer.innerHTML = ""; // Limpa o conteúdo existente, exceto botões
      thumbnailsContainer.innerHTML = ""; // Limpa as miniaturas existentes

      // Adiciona os botões de navegação do carrossel
      const prevButton = document.createElement("button");
      prevButton.className = "button prev";
      prevButton.onclick = prevSlide;
      prevButton.textContent = "❮";
      carouselContainer.appendChild(prevButton);

      const nextButton = document.createElement("button");
      nextButton.className = "button next";
      nextButton.onclick = nextSlide;
      nextButton.textContent = "❯";
      carouselContainer.appendChild(nextButton);

      imovel.imagens.forEach((imgSrc, index) => {
        const img = document.createElement("img");
        img.className = "main";
        img.src = imgSrc;
        img.alt = `Imagem ${index + 1} do imóvel`;
        img.style.display = index === 0 ? "block" : "none"; // Mostra a primeira imagem
        img.addEventListener("click", () => openLightbox(index)); // Torna clicável para lightbox
        carouselContainer.appendChild(img);

        const thumb = document.createElement("img");
        thumb.src = imgSrc;
        thumb.alt = `Miniatura ${index + 1}`;
        thumb.onclick = () => setSlide(index);
        thumbnailsContainer.appendChild(thumb);
      });

      // Re-inicializa slides e thumbs para o script.js do carrossel
      slides = document.querySelectorAll("#detalhe-carousel img.main");
      thumbs = document.querySelectorAll("#detalhe-thumbnails img");
      showSlide(0); // Mostra o primeiro slide

      // Preencher informações detalhadas (ícones e texto)
      document.getElementById("detalhe-area").textContent = imovel.area;
      document.getElementById("detalhe-quartos").textContent = imovel.quartos;
      document.getElementById("detalhe-banheiros").textContent =
        imovel.banheiros;
      document.getElementById("detalhe-garagem").textContent = imovel.garagem;
      // Adiciona suítes se existir
      const suitesElement = document.getElementById("detalhe-suites");
      if (imovel.suites !== undefined && imovel.suites !== null) {
        suitesElement.textContent = imovel.suites;
      } else {
        // Se não houver suítes, você pode esconder o item ou definir um valor padrão
        suitesElement.closest(".info-item").style.display = "none";
      }

      // Preencher descrição longa
      const descricaoContainer = document.getElementById("detalhe-descricao");
      descricaoContainer.innerHTML = ""; // Limpa conteúdo existente
      imovel.descricao_longa.forEach((paragrafo) => {
        const p = document.createElement("p");
        p.textContent = paragrafo;
        descricaoContainer.appendChild(p);
      });

      // Atualizar link do WhatsApp
      document.getElementById("detalhe-whatsapp").href = imovel.whatsapp_link;
    })
    .catch((error) =>
      console.error("Erro ao carregar detalhes do imóvel:", error)
    );
});
