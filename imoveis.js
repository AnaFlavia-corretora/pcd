document.addEventListener("DOMContentLoaded", () => {
  fetch("imoveis.json")
    .then((res) => {
      if (!res.ok) {
        // Verifica se a resposta da rede foi bem-sucedida (status 200 OK)
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((imoveis) => {
      const container = document.getElementById("lista-imoveis");
      if (!container) {
        console.error("Elemento #lista-imoveis não encontrado.");
        return;
      }

      imoveis.forEach((imovel) => {
        const card = document.createElement("div");
        card.className = "imovel-card";
        card.innerHTML = `
          <img src="${imovel.imagens[0]}" class="imovel-card-image">
          <div class="imovel-card-content">
            <h3>${imovel.tipo}</h3>
            <div class="imovel-details">
              <div class="imovel-location">
                ${imovel.localizacao}
              </div>
            </div>
            <div class="imovel-price">${imovel.valor}</div>
          </div>
          <a href="https://wa.me/5547991175167?text=Olá! Tenho interesse em informações sobre carros PCD." target="_blank" class="imovel-button">WhatsApp</a>
        `;
        container.appendChild(card);
      });
    })
    .catch((error) => console.error("Erro ao carregar imóveis:", error));
});
