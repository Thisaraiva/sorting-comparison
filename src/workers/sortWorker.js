const { workerData, parentPort, threadId } = require("worker_threads");
const fs = require("fs");
const { trace } = require('@opentelemetry/api');
const tracer = trace.getTracer('sorting-app');

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

async function executeSort() {
    return tracer.startActiveSpan('sortWorker.execute', async span => {
        try {
            const { algorithm, size, parallel = false } = workerData;
            const filePath = `src/data/numbers_${size}.txt`;
            
            span.setAttributes({
                'file.path': filePath,
                'data.size': size,
                'algorithm': algorithm,
                'thread.id': threadId,
                'parallel.enabled': parallel
            });

            const data = fs.readFileSync(filePath, "utf8");
            const numbers = data.split(",").map(Number);
            span.setAttribute('data.length', numbers.length);

            const SorterClass = algorithms[algorithm];
            if (!SorterClass) {
                throw new Error(`Algoritmo ${algorithm} não encontrado`);
            }

            const sorter = new SorterClass();
            const start = Date.now();
            const result = await sorter.sort(numbers, { parallel });
            const executionTime = Date.now() - start;

            const logMessage = `Thread ${threadId} - ${algorithm} ${parallel ? '(parallel)' : ''} - Lendo arquivo: ${filePath}, Algoritmo: ${algorithm}, Tamanho do conjunto de dados: ${size}, Dados lidos: ${data.substring(0, 50)}..., Números convertidos: ${numbers.length} elementos, Tempo de execução: ${executionTime}ms, Comparações: ${result.comparisons}, Trocas: ${result.swaps}`;
            console.log(logMessage);
            fs.appendFileSync('src/logs/execution.log', `${new Date().toISOString()} - ${logMessage}\n`);

            span.setAttributes({
                'execution.time': executionTime,
                'algorithm.comparisons': result.comparisons,
                'algorithm.swaps': result.swaps
            });

            return {
                algorithm,
                size,
                time: executionTime,
                comparisons: result.comparisons,
                swaps: result.swaps
            };
        } catch (error) {
            console.error(`Thread ${threadId} - Error: ${error.message}`);
            fs.appendFileSync('src/logs/execution.log', `${new Date().toISOString()} - Thread ${threadId} - Error: ${error.message}\n`);
            span.recordException(error);
            throw error;
        } finally {
            span.end();
        }
    });
}

executeSort()
    .then(result => parentPort.postMessage(result))
    .catch(error => parentPort.postMessage({ error: error.message }));