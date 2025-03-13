const { workerData, parentPort } = require("worker_threads");
const fs = require("fs");
const { Logger } = require('@opentelemetry/api-logs');

// Importação de todos os algoritmos de ordenação
const BubbleSort = require("../algorithms/bubbleSort");
const BubbleSortImproved = require("../algorithms/bubbleSortImproved");
const InsertionSort = require("../algorithms/insertionSort");
const SelectionSort = require("../algorithms/selectionSort");
const QuickSort = require("../algorithms/quickSort");
const MergeSort = require("../algorithms/mergeSort");
const TimSort = require("../algorithms/timSort");
const HeapSort = require("../algorithms/heapSort");
const CountingSort = require("../algorithms/countingSort");
const RadixSort = require("../algorithms/radixSort");
const ShellSort = require("../algorithms/shellSort");

const { algorithm, size } = workerData;

let sorter;

// Seleciona o algoritmo com base no parâmetro recebido
switch (algorithm) {
    case "bubble":
        sorter = new BubbleSort();
        break;
    case "bubble-improved":
        sorter = new BubbleSortImproved();
        break;
    case "insertion":
        sorter = new InsertionSort();
        break;
    case "selection":
        sorter = new SelectionSort();
        break;
    case "quick":
        sorter = new QuickSort();
        break;
    case "merge":
        sorter = new MergeSort();
        break;
    case "tim":
        sorter = new TimSort();
        break;
    case "heap":
        sorter = new HeapSort();
        break;
    case "counting":
        sorter = new CountingSort();
        break;
    case "radix":
        sorter = new RadixSort();
        break;
    case "shell":
        sorter = new ShellSort();
        break;
    default:
        throw new Error("Algoritmo inválido");
}

// Lê os dados do arquivo
try {
    const filePath = `src/data/numbers_${size}.txt`;
    console.log(`Lendo arquivo: ${filePath}`);

    const data = fs.readFileSync(filePath, "utf8");
    console.log(`Dados lidos: ${data.substring(0, 50)}...`); // Exibe os primeiros 50 caracteres

    let numbers = data.split(",").map(Number);
    console.log(`Números convertidos: ${numbers.length} elementos`);

    if (!numbers || numbers.length === 0) {
        throw new Error("Dados inválidos ou arquivo vazio.");
    }

    // Executa o algoritmo e mede o tempo de execução
    const start = Date.now();
    const result = sorter.sort(numbers);
    const end = Date.now();

    // Logs detalhados
    const logMessage = `Lendo arquivo: ${filePath}, Algoritmo: ${algorithm}, Tamanho do conjunto de dados: ${size}, Dados lidos: ${data.substring(0, 50)}..., Números convertidos: ${numbers.length} elementos, Tempo de execução: ${end - start}ms, Comparações: ${result.comparisons}, Trocas: ${result.swaps}`;
    console.log(logMessage);

    // Escreve o log no arquivo execution.log
    fs.appendFileSync('src/logs/execution.log', `${new Date().toISOString()} - ${logMessage}\n`);

    // Envia os resultados de volta para o thread principal
    parentPort.postMessage({
        algorithm,
        size,
        time: end - start, // Tempo de execução em milissegundos
        comparisons: result.comparisons, // Número de comparações
        swaps: result.swaps, // Número de trocas
    });
} catch (error) {
    console.error(`Erro no Worker: ${error.message}`);
    fs.appendFileSync('src/logs/execution.log', `${new Date().toISOString()} - Erro no Worker: ${error.message}\n`);
    parentPort.postMessage({
        error: error.message,
    });
}