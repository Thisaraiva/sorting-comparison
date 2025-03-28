const { workerData, parentPort } = require("worker_threads");
const fs = require("fs");
const path = require("path");
const { registerLog } = require("../opentelemetry/telemetry");

const algorithms = {
    "bubble": require("../algorithms/bubbleSort"),
    "bubble-improved": require("../algorithms/bubbleSortImproved"),
    "insertion": require("../algorithms/insertionSort"),
    "selection": require("../algorithms/selectionSort"),
    "quick": require("../algorithms/quickSort"),
    "merge": require("../algorithms/mergeSort"),
    "tim": require("../algorithms/timSort"),
    "heap": require("../algorithms/heapSort"),
    "counting": require("../algorithms/countingSort"),
    "radix": require("../algorithms/radixSort"),
    "shell": require("../algorithms/shellSort")
};

async function runSorting() {
    const { algorithm, size, workerId } = workerData;

    try {
        if (!algorithms[algorithm]) {
            throw new Error(`Algoritmo inválido: ${algorithm}`);
        }

        const sorter = new algorithms[algorithm]();
        
        const filePath = path.join(__dirname, `../data/numbers_${size}.txt`);
        registerLog('info', 'Iniciando execução paralela', {
            algorithm,
            size,
            workerId,
            threadId: workerData.threadId,
            filePath
        });

        const data = fs.readFileSync(filePath, "utf8").trim();
        let numbers = data.split(",").map(num => parseInt(num.trim(), 10));
        numbers = numbers.filter(num => !isNaN(num));

        if (numbers.length === 0) {
            throw new Error("Nenhum número válido encontrado");
        }

        const start = Date.now();
        const result = await sorter.sort(numbers);
        const end = Date.now();

        registerLog('info', 'Execução paralela concluída', {
            algorithm,
            size,
            time: end - start,
            comparisons: result.comparisons,
            swaps: result.swaps,
            workerId,
            threadId: workerData.threadId,
            elementsProcessed: numbers.length
        });

        parentPort.postMessage({
            algorithm,
            size,
            time: end - start,
            comparisons: result.comparisons,
            swaps: result.swaps,
            workerId,
            threadId: workerData.threadId
        });
    } catch (error) {
        registerLog('error', 'Erro na execução paralela', {
            algorithm,
            size,
            error: error.message,
            workerId,
            threadId: workerData.threadId
        });
        parentPort.postMessage({ error: error.message });
    }
}

// Inicia a execução
runSorting().catch(err => {
    parentPort.postMessage({ error: err.message });
});