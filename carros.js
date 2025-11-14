// Arquivo: carros.js

let imoveisData = [];

/**
 * Converte a string de preco_pcd para um float para ordenação/cálculo.
 * Torna a limpeza mais robusta removendo todos os caracteres não numéricos,
 * exceto vírgulas e pontos, e padronizando o decimal.
 * @param {string} valorString - O preco_pcd em formato string (ex: "R$ 74.350,00").
 * @returns {number} O preco_pcd numérico.
 */
function cleanAndParseValue(valorString) {
  if (!valorString) return 0; // Trata valores nulos ou vazios para evitar NaN

  // 1. Remove TUDO que não seja dígito, vírgula ou ponto.
  let cleanedValue = valorString.replace(/[^0-9.,]/g, "").trim();

  // 2. Conta quantas vírgulas e pontos existem.
  const commaCount = (cleanedValue.match(/,/g) || []).length;
  const dotCount = (cleanedValue.match(/\./g) || []).length;

  // 3. Heurística para determinar o separador decimal:
  if (commaCount > 0 && dotCount > 0) {
    // Se há ambos, o último geralmente é o decimal no padrão BR.
    if (cleanedValue.lastIndexOf(",") > cleanedValue.lastIndexOf(".")) {
      // Padrão BR: Ponto é milhar, Vírgula é decimal. Remove pontos, troca vírgula por ponto.
      cleanedValue = cleanedValue.replace(/\./g, "").replace(",", ".");
    } else {
      // Padrão EN: Vírgula é milhar, Ponto é decimal. Remove vírgulas.
      cleanedValue = cleanedValue.replace(/,/g, "");
    }
  } else if (commaCount === 1 && dotCount === 0) {
    // Se há apenas uma vírgula, assume-se que é o separador decimal.
    cleanedValue = cleanedValue.replace(",", ".");
  }

  // 4. Converte para float. Se a string estiver vazia ou inválida, retorna 0.
  const parsedValue = parseFloat(cleanedValue);
  return isNaN(parsedValue) ? 0 : parsedValue;
}

/**
 * Calcula o Desconto: localização (Preço Teto/Público) - preco_pcd (Preço PCD).
 * @param {Object} carro - O objeto do imóvel.
 * @returns {number} O preco_pcd do desconto.
 */
function calculateDesconto(carro) {
  // Presumindo que 'preco_publico' e 'preco_pcd' são as colunas mencionadas
  // e que 'preco_publico' representa o preço público e 'preco_pcd' o preço final.
  // Garantimos que 'preco_publico' e 'preco_pcd' existem para evitar erros.
  const precoPublico = cleanAndParseValue(carro.preco_publico || "R$ 0,00");
  const precoPCD = cleanAndParseValue(carro.preco_pcd || "R$ 0,00");

  // Adiciona uma verificação extra para garantir que ambos são números antes de subtrair
  if (typeof precoPublico === "number" && typeof precoPCD === "number") {
    return precoPublico - precoPCD;
  }
  return 0; // Retorna 0 em caso de erro, ao invés de NaN
}

/**
 * Calcula o percentual de desconto: (Desconto / Preço Público) * 100.
 * Retorna o percentual como string com 2 casas decimais para exibição.
 * @param {Object} carro - O objeto do carro.
 * @returns {string} O percentual de desconto (ex: "15.50").
 */
function calculateDescontoPercentage(carro) {
  const desconto = calculateDesconto(carro);
  const precoPublico = cleanAndParseValue(carro.preco_publico || "R$ 0,00");

  if (precoPublico > 0) {
    // Multiplica por 100 e limita a 2 casas decimais
    return ((desconto / precoPublico) * 100).toFixed(2);
  }
  return "0.00"; // Retorna string
}

/**
 * NOVO: Calcula o percentual de desconto (número) para fins de ordenação.
 * @param {Object} carro - O objeto do carro.
 * @returns {number} O percentual de desconto (ex: 15.5).
 */
function calculateDescontoPercentageNumeric(carro) {
  const desconto = calculateDesconto(carro);
  const precoPublico = cleanAndParseValue(carro.preco_publico || "R$ 0,00");

  if (precoPublico > 0) {
    const percentage = (desconto / precoPublico) * 100;
    // CORREÇÃO: Arredonda o valor para evitar problemas de precisão
    // de ponto flutuante (floating point errors) na ordenação em servidores.
    return Math.round(percentage * 1000) / 1000; // Limita a 3 casas decimais
  }
  return 0;
}

/**
 * Formata um número como moeda brasileira (R$ X.XXX,XX).
 * @param {number} value - O preco_pcd numérico.
 * @returns {string} O preco_pcd formatado.
 */
function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Ordena a lista de imóveis com base na opção selecionada.
 * @param {Array<Object>} data - O array de objetos dos imóveis.
 * @param {string} sortOption - A opção de ordenação ('valor_asc', 'marca_asc', 'desconto_desc', 'desconto_percentual_desc' ou 'default').
 * @returns {Array<Object>} O array de imóveis ordenado.
 */
function sortImoveis(data, sortOption) {
  // Cria uma cópia do array para não modificar a ordem original.
  const sortedData = [...data];

  switch (sortOption) {
    case "valor_asc":
      sortedData.sort((a, b) => {
        const valorA = cleanAndParseValue(a.preco_pcd);
        const valorB = cleanAndParseValue(b.preco_pcd);
        return valorA - valorB; // Ordem crescente numérica
      });
      break;
    case "marca_asc":
      sortedData.sort((a, b) => {
        // Ordenação por string (alfabética A-Z)
        return a.marca.localeCompare(b.marca, "pt-BR");
      });
      break;
    case "desconto_desc":
      sortedData.sort((a, b) => {
        const descontoA = calculateDesconto(a);
        const descontoB = calculateDesconto(b);
        return descontoB - descontoA; // Ordem decrescente de desconto (R$)
      });
      break;
    case "desconto_percentual_desc": // NOVO CASE
      sortedData.sort((a, b) => {
        const percentualA = calculateDescontoPercentageNumeric(a); // Usa a nova função
        const percentualB = calculateDescontoPercentageNumeric(b); // Usa a nova função
        return percentualB - percentualA; // Ordem decrescente de desconto (%)
      });
      break;
    case "default":
    default:
      // Retorna a lista original sem ordenar.
      return data;
  }
  return sortedData;
}

// Arquivo: carros.js (Funções cleanAndParseValue, calculateDesconto, formatCurrency e sortImoveis permanecem as mesmas)
// ...

// ... (funções calculateDesconto, formatCurrency, etc. permanecem as mesmas)

/**
 * Renderiza os cartões dos imóveis no container, adicionando separadores por marca se necessário.
 * @param {Array<Object>} carros - O array de imóveis a ser exibido (já ordenado).
 * @param {string} currentSortOption - A opção de ordenação atual.
 */
function renderImoveis(carros, currentSortOption) {
  const container = document.getElementById("lista-carros");
  if (!container) {
    console.error("Elemento #lista-carros não encontrado.");
    return;
  }

  container.innerHTML = ""; // Limpa o conteúdo existente

  const isSortedByMarca = currentSortOption === "marca_asc";
  // Verifica se a ordenação atual é por Desconto (R$) OU Desconto (%)
  const shouldShowDiscount =
    currentSortOption === "desconto_desc" ||
    currentSortOption === "desconto_percentual_desc";

  let lastMarca = null; // Usado para rastrear a marca anterior

  carros.forEach((carro) => {
    // Lógica de separação por marca (igual ao código anterior)
    if (isSortedByMarca && carro.marca !== lastMarca) {
      // 1. Cria o título da marca
      const marcaTitle = document.createElement("h2");
      marcaTitle.className = "marca-group-title";
      marcaTitle.textContent = carro.marca;
      container.appendChild(marcaTitle);

      // 2. Cria a linha separadora
      const separator = document.createElement("hr");
      separator.className = "marca-separator-line";
      container.appendChild(separator);
    }

    // Define o conteúdo do título do cartão
    const cardTitle = isSortedByMarca
      ? `${carro.modelo}`
      : `${carro.marca} ${carro.modelo}`;

    let discountHTML = "";

    // 🚀 LÓGICA DE EXIBIÇÃO: SÓ GERA O HTML SE shouldShowDiscount FOR TRUE
    if (shouldShowDiscount) {
      const descontoValue = calculateDesconto(carro);
      const descontoFormatted = formatCurrency(descontoValue);

      // Calcula o percentual
      const descontoPercentual = calculateDescontoPercentage(carro);
      discountHTML = `
            <div class="carro-details">
                <div class="carro-location discount-info">
                    Desconto: ${descontoFormatted} (${descontoPercentual}%)
                </div>
            </div>
        `;
    }

    // Lógica de renderização do cartão
    const card = document.createElement("div");
    card.className = "carro-card";
    card.innerHTML = `
          <img src="${carro.imagens[0]}" class="carro-card-image">
          <div class="carro-card-content">
            <h3>${cardTitle}</h3>
            <div class="carro-details">
              <div class="carro-location">
                ${carro.preco_publico}
              </div>
            </div>
            
            ${discountHTML} 
            
            <div class="carro-price">${carro.preco_pcd}</div>
          </div>
          <a href="https://wa.me/5547991175167?text=Olá! Tenho interesse em informações sobre carros PCD." target="_blank" class="carro-button">WhatsApp</a>
        `;
    container.appendChild(card);

    // Atualiza a última marca
    lastMarca = carro.marca;
  });
}

// ... Resto do código (DOMContentLoaded)

document.addEventListener("DOMContentLoaded", () => {
  const sortSelect = document.getElementById("sort-select");

  // Lógica do botão "Voltar ao Topo" movida para DENTRO do DOMContentLoaded
  const scrollButton = document.getElementById("scrollToTopBtn");

  // 1. Função para rolar para o topo
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Rola suavemente
    });
  }

  // 2. Função para controlar a visibilidade do botão
  function toggleScrollToTopButton() {
    // Exibe o botão se a rolagem vertical for maior que 300 pixels
    if (
      document.body.scrollTop > 300 ||
      document.documentElement.scrollTop > 300
    ) {
      scrollButton.classList.add("show");
    } else {
      scrollButton.classList.remove("show");
    }
  }

  // 3. Adiciona os Event Listeners
  if (scrollButton) {
    scrollButton.addEventListener("click", scrollToTop);
    // Adiciona o listener de rolagem APÓS o botão ser encontrado
    window.addEventListener("scroll", toggleScrollToTopButton);
  }

  // Lógica de Carregamento e Ordenação (já existente)
  fetch("carros.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((carros) => {
      // Armazena os dados originais
      imoveisData = carros;

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
