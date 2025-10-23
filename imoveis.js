// Arquivo: imoveis.js

let imoveisData = [];

/**
 * Converte a string de valor (R$ X.XXX,XX) para um número (float) para ordenação.
 * @param {string} valorString - O valor em formato string (ex: "R$ 74.350,00").
 * @returns {number} O valor numérico.
 */
function cleanAndParseValue(valorString) {
  // Remove "R$", pontos de milhar, substitui a vírgula por ponto decimal e converte para número.
  const cleanedValue = valorString
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  return parseFloat(cleanedValue);
}

/**
 * Ordena a lista de imóveis com base na opção selecionada.
 * @param {Array<Object>} data - O array de objetos dos imóveis.
 * @param {string} sortOption - A opção de ordenação ('valor_asc', 'marca_asc' ou 'default').
 * @returns {Array<Object>} O array de imóveis ordenado.
 */
function sortImoveis(data, sortOption) {
  // Cria uma cópia do array para não modificar a ordem original.
  const sortedData = [...data];

  switch (sortOption) {
    case "valor_asc":
      sortedData.sort((a, b) => {
        const valorA = cleanAndParseValue(a.valor);
        const valorB = cleanAndParseValue(b.valor);
        return valorA - valorB; // Ordem crescente numérica
      });
      break;
    case "marca_asc":
      sortedData.sort((a, b) => {
        // Ordenação por string (alfabética A-Z)
        return a.marca.localeCompare(b.marca, "pt-BR");
      });
      break;
    case "default":
    default:
      // Retorna a lista original sem ordenar.
      return data;
  }
  return sortedData;
}

/**
 * Renderiza os cartões dos imóveis no container, adicionando separadores por marca se necessário.
 * @param {Array<Object>} imoveis - O array de imóveis a ser exibido (já ordenado).
 * @param {string} currentSortOption - A opção de ordenação atual.
 */
function renderImoveis(imoveis, currentSortOption) {
  const container = document.getElementById("lista-imoveis");
  if (!container) {
    console.error("Elemento #lista-imoveis não encontrado.");
    return;
  }

  container.innerHTML = ""; // Limpa o conteúdo existente
  const isSortedByMarca = currentSortOption === "marca_asc";
  let lastMarca = null; // Usado para rastrear a marca anterior

  imoveis.forEach((imovel) => {
    // Lógica de separação por marca
    if (isSortedByMarca && imovel.marca !== lastMarca) {
      // 1. Cria o título da marca
      const marcaTitle = document.createElement("h2");
      marcaTitle.className = "marca-group-title";
      marcaTitle.textContent = imovel.marca;
      container.appendChild(marcaTitle);

      // 2. Cria a linha separadora
      const separator = document.createElement("hr");
      separator.className = "marca-separator-line";
      container.appendChild(separator);
    }

    // Lógica de renderização do cartão
    const card = document.createElement("div");
    card.className = "imovel-card";
    card.innerHTML = `
          <img src="${imovel.imagens[0]}" class="imovel-card-image">
          <div class="imovel-card-content">
            <h3>${imovel.marca} ${imovel.tipo}</h3>
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

    // 3. Atualiza a última marca
    lastMarca = imovel.marca;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const sortSelect = document.getElementById("sort-select");

  fetch("imoveis.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((imoveis) => {
      // Armazena os dados originais
      imoveisData = imoveis;

      // Pega a opção inicial e ordena/renderiza
      const initialSortOption = sortSelect ? sortSelect.value : "default";
      const initialList = sortImoveis(imoveisData, initialSortOption);
      renderImoveis(initialList, initialSortOption);

      // Adiciona o Event Listener para a ordenação
      if (sortSelect) {
        sortSelect.addEventListener("change", (event) => {
          const selectedOption = event.target.value;
          const sortedList = sortImoveis(imoveisData, selectedOption);
          // Passa a opção selecionada para o renderizador
          renderImoveis(sortedList, selectedOption);
        });
      }
    })
    .catch((error) => console.error("Erro ao carregar os imóveis:", error));
});
