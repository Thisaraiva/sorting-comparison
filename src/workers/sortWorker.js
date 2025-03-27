const { workerData, parentPort } = require("worker_threads");
const fs = require("fs");
const { trace } = require('@opentelemetry/api');
const tracer = trace.getTracer('sorting-app');

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

tracer.startActiveSpan('sortWorker.execute', span => {
    try {
        const filePath = `src/data/numbers_${size}.txt`;
        console.log(`Lendo arquivo: ${filePath}`);
        span.setAttributes({ 'file.path': filePath, 'data.size': size, 'algorithm': algorithm });

        const data = fs.readFileSync(filePath, "utf8");
        const numbers = data.split(",").map(Number);
        span.setAttributes({ 'data.length': numbers.length });

        const start = Date.now();
        // Garante que a chamada a sorter.sort() seja aguardada com .then()
        Promise.resolve(sorter.sort(numbers)).then(result => {
            const end = Date.now();
            const executionTime = end - start;
            const logMessage = `Lendo arquivo: ${filePath}, Algoritmo: ${algorithm}, Tamanho do conjunto de dados: ${size}, Dados lidos: ${data.substring(0, 50)}..., Números convertidos: ${numbers.length} elementos, Tempo de execução: ${end - start}ms, Comparações: ${result.comparisons}, Trocas: ${result.swaps}`;
            console.log(logMessage);
            fs.appendFileSync('src/logs/execution.log', `${new Date().toISOString()} - ${logMessage}\n`);
            span.setAttributes({ 'execution.time': executionTime, 'algorithm.comparisons': result.comparisons, 'algorithm.swaps': result.swaps });
            span.end();
            parentPort.postMessage({
                algorithm,
                size,
                time: executionTime,
                comparisons: result.comparisons,
                swaps: result.swaps,
            });
        }).catch(error => {
            console.error(`Erro no Worker: ${error.message}`);
            fs.appendFileSync('src/logs/execution.log', `${new Date().toISOString()} - Erro no Worker: ${error.message}\n`);
            span.recordException(error);
            span.end();
            parentPort.postMessage({ error: error.message });
        });

    } catch (error) {
        console.error(`Erro no Worker: ${error.message}`);
        fs.appendFileSync('src/logs/execution.log', `${new Date().toISOString()} - Erro no Worker: ${error.message}\n`);
        span.recordException(error);
        span.end();
        parentPort.postMessage({ error: error.message });
    }
});