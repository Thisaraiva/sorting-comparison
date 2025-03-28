const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');
const { trace } = require('@opentelemetry/api');
const tracer = trace.getTracer('sorting-app');

class QuickSort {
    constructor() {
        this.maxSubArraySizeForParallel = 20000;
        this.numCores = os.cpus().length;
    }

    async sort(array, options = {}) {
        return tracer.startActiveSpan('quickSort.sort', async span => {
            try {
                span.setAttributes({
                    'algorithm.name': 'quickSort',
                    'array.size': array.length,
                    'parallel.enabled': options.parallel || false
                });

                let comparisons = 0;
                let swaps = 0;

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

                const quickSort = async (arr, low, high, depth = 0) => {
                    if (low < high) {
                        const pi = partition(arr, low, high);
                        
                        if (options.parallel && (high - low + 1) > this.maxSubArraySizeForParallel && depth < 2) {
                            const leftTask = this.runInWorker(arr, low, pi - 1, depth + 1, options);
                            const rightTask = quickSort(arr, pi + 1, high, depth + 1);
                            await Promise.all([leftTask, rightTask]);
                        } else {
                            await quickSort(arr, low, pi - 1, depth + 1);
                            await quickSort(arr, pi + 1, high, depth + 1);
                        }
                    }
                };

                await quickSort(array, 0, array.length - 1);

                span.setAttributes({
                    'algorithm.comparisons': comparisons,
                    'algorithm.swaps': swaps
                });

                return { sortedArray: array, comparisons, swaps };
            } catch (error) {
                span.recordException(error);
                throw error;
            } finally {
                span.end();
            }
        });
    }

    runInWorker(arr, low, high, depth, options) {
        return new Promise((resolve, reject) => {
            const workerCode = `
                const { parentPort, workerData } = require('worker_threads');
                const { QuickSort } = require('./quickSort');
                const sorter = new QuickSort();
                sorter.sort(workerData.array, workerData.options)
                    .then(result => parentPort.postMessage(result))
                    .catch(error => parentPort.postMessage({ error: error.message }));
            `;

            const worker = new Worker(workerCode, {
                eval: true,
                workerData: {
                    array: arr.slice(low, high + 1),
                    options: { ...options, parallel: false } // Desativa paralelismo dentro do worker
                }
            });

            worker.on('message', (result) => {
                if (result.error) {
                    reject(new Error(result.error));
                } else {
                    // Copia o resultado de volta para o array original
                    for (let i = 0; i < result.sortedArray.length; i++) {
                        arr[low + i] = result.sortedArray[i];
                    }
                    resolve(result);
                }
            });

            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0) {
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }
            });
        });
    }
}

module.exports = QuickSort;