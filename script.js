/* CONTROLE DE QUALIDADE DE TOMATES - LÓGICA MATRICIAL
  Autor: Gemini (Assistente de Engenharia)
*/

// Configurações Globais
const MATRIX_SIZE = 50; // Downsampling para 50x50 (Matriz de 2500 elementos)

// Elementos do DOM
const fileInput = document.getElementById('imageInput');
const previewContainer = document.getElementById('previewContainer');
const userImage = document.getElementById('userImage');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultSection = document.getElementById('resultSection');
const resultOutput = document.getElementById('resultOutput');
const mathLog = document.getElementById('mathDetails');
const processingCanvas = document.getElementById('processingCanvas');
const ctx = processingCanvas.getContext('2d');

// Armazena as matrizes de referência carregadas da página
let referenceMatrices = {};

// 1. Inicialização: Carregar e processar as imagens de referência ao abrir a página
window.onload = () => {
    const refs = [
        { id: 'ref-healthy', label: 'Saudável' },
        { id: 'ref-unripe', label: 'Verde' },
        { id: 'ref-rotten1', label: 'Podre (Tipo A)' },
        { id: 'ref-rotten2', label: 'Podre (Tipo B)' }
    ];

    refs.forEach(ref => {
        const imgElement = document.getElementById(ref.id);
        // Garante que a imagem carregou antes de converter
        if (imgElement.complete) {
            referenceMatrices[ref.label] = imageToMatrix(imgElement);
        } else {
            imgElement.onload = () => {
                referenceMatrices[ref.label] = imageToMatrix(imgElement);
            };
        }
    });

    console.log("Matrizes de referência carregadas no espaço vetorial.");
};

// 2. Manipulação do Upload do Usuário
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            userImage.src = event.target.result;
            previewContainer.style.display = 'block';
            analyzeBtn.disabled = false;
            
            // Limpa resultados anteriores
            resultSection.classList.add('hidden');
        }
        reader.readAsDataURL(file);
    }
});

// 3. Ação de Análise (O Cálculo Matemático)
analyzeBtn.addEventListener('click', () => {
    // A. Converter imagem do usuário em Matriz U
    const userMatrix = imageToMatrix(userImage);

    let maxScore = -Infinity;
    let winner = "";
    let logDetails = "--- RELATÓRIO DO TRAÇO MATRICIAL ---\n\n";

    // B. Comparar Matriz U com cada Matriz de Referência (R)
    // Usando Produto Interno: <U, R> = tr(U^T * R)
    
    for (const [label, refMatrix] of Object.entries(referenceMatrices)) {
        // Cálculo do Produto Interno
        const score = calculateTraceInnerProduct(userMatrix, refMatrix);
        
        logDetails += `Matriz Ref [${label}]:\n`;
        logDetails += `   Produto Interno <U, R> = ${score.toLocaleString('pt-BR')}\n`;
        
        if (score > maxScore) {
            maxScore = score;
            winner = label;
        }
    }

    // C. Exibir Resultados
    resultSection.classList.remove('hidden');
    resultOutput.innerHTML = `Diagnóstico: <span style="color: #e63946">${winner.toUpperCase()}</span>`;
    
    // Adiciona uma explicação matemática ao log
    logDetails += `\n--------------------------------------\n`;
    logDetails += `VENCEDOR: ${winner}\n`;
    logDetails += `Critério: Maior projeção ortogonal no espaço matricial.\n`;
    logDetails += `Fórmula utilizada: tr(A^t * B) = Σ (A_ij * B_ij)`;
    
    mathLog.textContent = logDetails;
});

/* =========================================================================
   FUNÇÕES MATEMÁTICAS E UTILITÁRIAS
   ========================================================================= */

/**
 * Converte um elemento de imagem HTML em uma matriz numérica (Array).
 * Realiza Downsampling para MATRIX_SIZE x MATRIX_SIZE.
 * Converte RGB para Escala de Cinza (Intensidade).
 */
function imageToMatrix(imgElement) {
    // Configura o canvas para o tamanho reduzido (Matriz NxN)
    processingCanvas.width = MATRIX_SIZE;
    processingCanvas.height = MATRIX_SIZE;

    // Desenha a imagem redimensionada no canvas (Downsampling)
    ctx.drawImage(imgElement, 0, 0, MATRIX_SIZE, MATRIX_SIZE);

    // Extrai os dados brutos dos pixels (RGBA)
    const imageData = ctx.getImageData(0, 0, MATRIX_SIZE, MATRIX_SIZE);
    const data = imageData.data;
    
    let matrix = [];

    // Percorre os pixels e converte para escala de cinza
    // i += 4 porque cada pixel tem 4 valores (R, G, B, Alpha)
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Fórmula de luminância padrão: 0.299R + 0.587G + 0.114B
        // Isso transforma a cor em um escalar (intensidade)
        const grayValue = (0.299 * r + 0.587 * g + 0.114 * b);
        
        matrix.push(grayValue);
    }

    return matrix; // Retorna vetor de tamanho 2500 (50x50)
}

/**
 * Calcula o Produto Interno do Traço entre duas matrizes A e B.
 * Definição Matemática: <A, B> = tr(A^T * B)
 * * Computacionalmente, isso é equivalente à soma do produto elemento a elemento:
 * Σ (A_ij * B_ij) para todo i, j.
 * * @param {Array} matrixA - Vetor representando a matriz A
 * @param {Array} matrixB - Vetor representando a matriz B
 */
function calculateTraceInnerProduct(matrixA, matrixB) {
    let sum = 0;
    
    // Como as matrizes foram linearizadas em vetores, um único loop resolve.
    // Isso é matematicamente equivalente ao Traço da multiplicação matricial.
    for (let i = 0; i < matrixA.length; i++) {
        sum += matrixA[i] * matrixB[i];
    }

    return sum;
}