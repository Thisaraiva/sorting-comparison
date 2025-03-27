// src/algorithms/mergeSort.js
const { Worker } = require('worker_threads');
const os = require('os');
const SortStrategy = require("./strategy");
const { trace } = require('@opentelemetry/api');
const tracer = trace.getTracer('sorting-app');

class MergeSort extends SortStrategy {
    sort(array) {
        return tracer.startActiveSpan('mergeSort.sort', span => {
            let comparisons = 0;
            let swaps = 0;
            const maxSubArraySizeForParallel = 10000; // Ajuste conforme necessidade
            const numCores = os.cpus().length;
            const activeWorkers = new Set();

            const merge = (left, right) => {
                let result = [];
                let i = 0, j = 0;
                while (i < left.length && j < right.length) {
                    comparisons++;
                    if (left[i] <= right[j]) {
                        result.push(left[i++]);
                        swaps++;
                    } else {
                        result.push(right[j++]);
                        swaps++;
                    }
                }
                while (i < left.length) {
                    result.push(left[i++]);
                    swaps++;
                }
                while (j < right.length) {
                    result.push(right[j++]);
                    swaps++;
                }
                return result;
            };

            const mergeSortParallel = (arr) => {
                if (arr.length <= 1) {
                    return Promise.resolve(arr);
                }

                const mid = Math.floor(arr.length / 2);
                const left = arr.slice(0, mid);
                const right = arr.slice(mid);

                if (arr.length > maxSubArraySizeForParallel && activeWorkers.size < numCores) {
                    const workerPromise1 = new Promise(resolve => {
                        tracer.startActiveSpan('mergeSort.parallel.worker', workerSpan => {
                            const worker = new Worker(__filename, { workerData: { subArray: left, isWorker: true } });
                            activeWorkers.add(worker);
                            worker.on('message', resolve);
                            worker.on('error', (err) => {
                                console.error('Worker error:', err);
                                workerSpan.recordException(err);
                                workerSpan.end();
                                resolve(left);
                            });
                            worker.on('exit', (code) => {
                                if (code !== 0) {
                                    console.error(`Worker parou com código ${code}`);
                                    workerSpan.setAttributes({ 'worker.exitCode': code });
                                    workerSpan.end();
                                    resolve(left);
                                }
                            });
                        });
                    });

                    const workerPromise2 = new Promise(resolve => {
                        tracer.startActiveSpan('mergeSort.parallel.worker', workerSpan => {
                            const worker = new Worker(__filename, { workerData: { subArray: right, isWorker: true } });
                            activeWorkers.add(worker);
                            worker.on('message', resolve);
                            worker.on('error', (err) => {
                                console.error('Worker error:', err);
                                workerSpan.recordException(err);
                                workerSpan.end();
                                resolve(right);
                            });
                            worker.on('exit', (code) => {
                                if (code !== 0) {
                                    console.error(`Worker parou com código ${code}`);
                                    workerSpan.setAttributes({ 'worker.exitCode': code });
                                    workerSpan.end();
                                    resolve(right);
                                }
                            });
                        });
                    });

                    return Promise.all([workerPromise1, workerPromise2])
                        .then(([sortedLeft, sortedRight]) => {
                            activeWorkers.clear();
                            const merged = merge(sortedLeft, sortedRight);
                            swaps += merged.length; // Aproximação de swaps
                            return merged;
                        });
                } else {
                    return Promise.all([mergeSortParallel(left), mergeSortParallel(right)])
                        .then(([sortedLeft, sortedRight]) => {
                            const merged = merge(sortedLeft, sortedRight);
                            swaps += merged.length; // Aproximação de swaps
                            return merged;
                        });
                }
            };

            return mergeSortParallel(array)
                .then(sortedArray => {
                    span.setAttributes({ 'algorithm.comparisons': comparisons, 'algorithm.swaps': swaps });
                    span.end();
                    return { sortedArray, comparisons, swaps };
                })
                .catch(err => {
                    span.recordException(err);
                    span.end();
                    throw err;
                });
        });
    }
}

// Execução dentro do worker
if (module.parent) {
    module.exports = MergeSort;
} else if (workerData && workerData.isWorker) {
    const { workerData, parentPort } = require('worker_threads');
    const sorter = new MergeSort();
    sorter.sort(workerData.subArray).then(result => parentPort.postMessage(result));
} else {
    module.exports = MergeSort;
}