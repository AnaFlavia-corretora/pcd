import json
import os
import csv

# =======================
# CONFIGURAÇÃO
# =======================
RAIZ = "."  # pasta raiz (script está aqui)
ARQUIVO_SAIDA = "precos_pcd_formatado.csv"

def limpar_preco(valor):
    if not valor:
        return ""
    return valor.replace("De:", "").strip()

with open(ARQUIVO_SAIDA, "w", newline="", encoding="utf-8") as csvfile:
    writer = csv.writer(csvfile, delimiter="\t")

    for marca in os.listdir(RAIZ):
        pasta_marca = os.path.join(RAIZ, marca)

        if not os.path.isdir(pasta_marca) or marca.startswith("."):
            continue

        for arquivo in os.listdir(pasta_marca):
            if not arquivo.endswith(".json"):
                continue

            caminho_json = os.path.join(pasta_marca, arquivo)

            with open(caminho_json, encoding="utf-8") as f:
                texto = f.read()

                # Correção simples para JSON mal formatado
                texto = texto.replace("}\n  {", "},\n  {")

                dados = json.loads(texto)

                if isinstance(dados, dict):
                    dados = [dados]

                for item in dados:
                    modelo = item.get("modelo", "")
                    preco_publico = limpar_preco(item.get("preco_publico"))
                    preco_pcd = limpar_preco(item.get("preco_pcd"))

                    # Linha 1: MARCA + espaço + MODELO
                    writer.writerow([f"{marca.upper()} {modelo}"])

                    # Linha 2: Preço público
                    writer.writerow([f"De: {preco_publico}"])

                    # Linha 3: Preço PCD
                    writer.writerow([f"Por: {preco_pcd}"])

                    # Linha em branco entre blocos
                    writer.writerow([])

print(f"Arquivo CSV gerado com sucesso: {ARQUIVO_SAIDA}")
