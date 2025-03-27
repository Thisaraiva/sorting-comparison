// src/algorithms/quickSort.js
const { Worker } = require('worker_threads');
const os = require('os');
const SortStrategy = require("./strategy");
const { trace } = require('@opentelemetry/api');
const tracer = trace.getTracer('sorting-app');

class QuickSort extends SortStrategy {
    sort(array) {
        return tracer.startActiveSpan('quickSort.sort', span => {
            let comparisons = 0;
            let swaps = 0;
            const maxSubArraySizeForParallel = 100000; // Ajuste conforme necessidade
            const numCores = os.cpus().length;
            const activeWorkers = new Set();
            const workerPromises = [];

            const partition = (arr, low, high) => {
                const pivot = arr[high];
                let i = low - 1;
                for (let j = low; j < high; j++) {
                    comparisons++;
                    if (arr[j] < pivot) {
                        i++;
                        [arr[i], arr[j]] = [arr[j], arr[i]];
                        swaps++;
                    }
                }
                [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
                swaps++;
                return i + 1;
            };

            const quickSortParallel = (arr, low, high) => {
                if (low < high) {
                    const size = high - low + 1;
                    if (size > maxSubArraySizeForParallel && activeWorkers.size < numCores) {
                        const pi = partition(arr, low, high);
                        const mid = pi;

                        const workerPromise1 = new Promise(resolve => {
                            tracer.startActiveSpan('quickSort.parallel.worker', workerSpan => {
                                const worker = new Worker(__filename, {
                                    workerData: { subArray: arr.slice(low, mid), low, high: mid - 1, isWorker: true }
                                });
                                activeWorkers.add(worker);

                                worker.on('message', (workerResult) => {
                                    for (let i = 0; i < workerResult.sortedArray.length; i++) {
                                        arr[low + i] = workerResult.sortedArray[i];
                                    }
                                    comparisons += workerResult.comparisons;
                                    swaps += workerResult.swaps;
                                    activeWorkers.delete(worker);
                                    workerSpan.end();
                                    resolve();
                                });

                                worker.on('error', (error) => {
                                    console.error('Erro no worker:', error);
                                    activeWorkers.delete(worker);
                                    workerSpan.recordException(error);
                                    workerSpan.end();
                                    quickSortSequential(arr, low, mid - 1);
                                    resolve();
                                });

                                worker.on('exit', (code) => {
                                    if (code !== 0) {
                                        console.error(`Worker parou com código ${code}`);
                                        activeWorkers.delete(worker);
                                        workerSpan.setAttributes({ 'worker.exitCode': code });
                                        workerSpan.end();
                                        quickSortSequential(arr, low, mid - 1);
                                        resolve();
                                    }
                                });
                            });
                        });

                        const workerPromise2 = quickSortParallel(arr, mid + 1, high);
                        return Promise.all([workerPromise1, workerPromise2]);

                    } else {
                        quickSortSequential(arr, low, high);
                    }
                }
                return Promise.resolve();
            };

            const quickSortSequential = (arr, low, high) => {
                if (low < high) {
                    const pi = partition(arr, low, high);
                    quickSortSequential(arr, low, pi - 1);
                    quickSortSequential(arr, pi + 1, high);
                }
            };

            return quickSortParallel(array, 0, array.length - 1)
                .then(() => {
                    span.setAttributes({ 'algorithm.comparisons': comparisons, 'algorithm.swaps': swaps });
                    span.end();
                    return { sortedArray: array, comparisons, swaps };
                })
                .catch(err => {
                    span.recordException(err);
                    span.end();
                    throw err;
                });
        });
    }
}

// Execução dentro do worker (para as chamadas recursivas paralelas)
if (module.parent) {
    module.exports = QuickSort;
} else if (workerData && workerData.isWorker) {
    const { workerData, parentPort } = require('worker_threads');
    const sorter = new QuickSort();
    sorter.sort(workerData.subArray).then(result => {
        parentPort.postMessage({
            sortedArray: result.sortedArray,
            comparisons: result.comparisons,
            swaps: result.swaps
        });
    }).catch(err => {
        console.error('Erro no worker:', err);
        parentPort.postMessage({ error: err.message });
    });
} else {
    module.exports = QuickSort;
}