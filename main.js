
"use strict";

// Elementos do formulário
const formItem = document.getElementById("formItem");
const descricao = document.getElementById("descricao");
const quantidade = document.getElementById("quantidade");
const preco = document.getElementById("preco");
const desconto = document.getElementById("desconto");

// Elementos da página
const listaItens = document.getElementById("listaItens");
const subtotalElemento = document.getElementById("subtotal");
const valorDescontoElemento = document.getElementById("valorDesconto");
const totalElemento = document.getElementById("total");
const botaoLimpar = document.getElementById("limpar");
const mensagem = document.getElementById("mensagem");

// Dados do orçamento
let itens = [];
let proximoId = 1;

// Formata números como moeda brasileira
function moeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Cria uma célula segura para a tabela
function criarCelula(valor) {
    const celula = document.createElement("td");
    celula.textContent = valor;
    return celula;
}

// Cadastra um item ao enviar o formulário
formItem.addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = descricao.value.trim();
    const qtd = Number(quantidade.value);
    const valor = Number(preco.value);

    if (nome === "") {
        mensagem.textContent = "Digite o nome do produto ou serviço.";
        descricao.focus();
        return;
    }

    if (!Number.isInteger(qtd) || qtd < 1) {
        mensagem.textContent = "A quantidade deve ser um número inteiro maior que zero.";
        quantidade.focus();
        return;
    }

    if (!Number.isFinite(valor) || valor <= 0) {
        mensagem.textContent = "Digite um preço maior que zero.";
        preco.focus();
        return;
    }

    // Guarda o item na lista
    itens.push({
        id: proximoId++,
        nome: nome,
        quantidade: qtd,
        preco: valor
    });

    mensagem.textContent = "Item cadastrado com sucesso!";

    // Atualiza a tela antes de limpar o formulário
    atualizarOrcamento();

    formItem.reset();
    quantidade.value = "1";
    descricao.focus();
});

// Desenha a tabela e calcula os valores
function atualizarOrcamento() {
    listaItens.replaceChildren();

    if (itens.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 5;
        celula.className = "vazio";
        celula.textContent = "Nenhum item cadastrado.";

        linha.appendChild(celula);
        listaItens.appendChild(linha);
    }

    // Adiciona cada item à tabela
    itens.forEach(function(item) {
        const linha = document.createElement("tr");

        linha.appendChild(criarCelula(item.nome));
        linha.appendChild(criarCelula(String(item.quantidade)));
        linha.appendChild(criarCelula(moeda(item.preco)));
        linha.appendChild(
            criarCelula(moeda(item.quantidade * item.preco))
        );

        const celulaAcao = document.createElement("td");
        const botaoExcluir = document.createElement("button");

        botaoExcluir.type = "button";
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.className = "botao-excluir";
        botaoExcluir.setAttribute(
            "aria-label",
            "Excluir " + item.nome
        );

        botaoExcluir.addEventListener("click", function() {
            itens = itens.filter(function(outroItem) {
                return outroItem.id !== item.id;
            });

            mensagem.textContent = "Item removido.";
            atualizarOrcamento();
        });

        celulaAcao.appendChild(botaoExcluir);
        linha.appendChild(celulaAcao);
        listaItens.appendChild(linha);
    });

    // Soma os subtotais dos itens
    const subtotal = itens.reduce(function(soma, item) {
        return soma + item.quantidade * item.preco;
    }, 0);

    // Garante que o desconto esteja entre 0 e 100
    let percentual = Number(desconto.value);

    if (!Number.isFinite(percentual)) {
        percentual = 0;
    }

    percentual = Math.min(100, Math.max(0, percentual));

    const valorDesconto = subtotal * percentual / 100;
    const total = subtotal - valorDesconto;

    // Atualiza os valores na página
    subtotalElemento.textContent = moeda(subtotal);
    valorDescontoElemento.textContent = moeda(valorDesconto);
    totalElemento.textContent = moeda(total);
}

// Atualiza os cálculos quando o desconto mudar
desconto.addEventListener("input", function() {
    atualizarOrcamento();
});

// Ajusta o valor do desconto ao sair do campo
desconto.addEventListener("change", function() {
    let percentual = Number(desconto.value);

    if (!Number.isFinite(percentual)) {
        percentual = 0;
    }

    percentual = Math.min(100, Math.max(0, percentual));
    desconto.value = String(percentual);

    atualizarOrcamento();
});

// Limpa o orçamento
botaoLimpar.addEventListener("click", function() {
    itens = [];
    desconto.value = "0";
    mensagem.textContent = "";

    formItem.reset();
    quantidade.value = "1";

    atualizarOrcamento();
});

// Exibe a tabela vazia ao abrir a página
atualizarOrcamento();
