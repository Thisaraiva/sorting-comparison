const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { trace } = require('@opentelemetry/api');
const tracer = trace.getTracer('sorting-app');

class MergeSort {
    constructor() {
        this.maxSubArraySizeForParallel = 50000;
    }

    async sort(array, options = {}) {
        return tracer.startActiveSpan('mergeSort.sort', async span => {
            try {
                span.setAttributes({
                    'algorithm.name': 'mergeSort',
                    'array.size': array.length,
                    'parallel.enabled': options.parallel || false
                });

                const result = await this.mergeSort(array, options);
                span.setAttributes({
                    'algorithm.comparisons': result.comparisons,
                    'algorithm.swaps': result.swaps
                });
                return result;
            } catch (error) {
                span.recordException(error);
                throw error;
            } finally {
                span.end();
            }
        });
    }

    async mergeSort(array, options, depth = 0) {
        if (array.length <= 1) {
            return { sortedArray: array, comparisons: 0, swaps: 0 };
        }

        const mid = Math.floor(array.length / 2);
        const left = array.slice(0, mid);
        const right = array.slice(mid);

        let leftResult, rightResult;

        if (options.parallel && array.length > this.maxSubArraySizeForParallel && depth < 2) {
            [leftResult, rightResult] = await Promise.all([
                this.runInWorker(left, options, depth + 1),
                this.mergeSort(right, options, depth + 1)
            ]);
        } else {
            [leftResult, rightResult] = await Promise.all([
                this.mergeSort(left, options, depth + 1),
                this.mergeSort(right, options, depth + 1)
            ]);
        }

        const merged = this.merge(leftResult.sortedArray, rightResult.sortedArray);
        
        return {
            sortedArray: merged.sortedArray,
            comparisons: leftResult.comparisons + rightResult.comparisons + merged.comparisons,
            swaps: leftResult.swaps + rightResult.swaps + merged.swaps
        };
    }

    merge(left, right) {
        let result = [];
        let i = 0, j = 0;
        let comparisons = 0;
        let swaps = 0;

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

        return { sortedArray: result, comparisons, swaps };
    }

    runInWorker(array, options, depth) {
        return new Promise((resolve, reject) => {
            const workerCode = `
                const { parentPort, workerData } = require('worker_threads');
                const { MergeSort } = require('./mergeSort');
                const sorter = new MergeSort();
                sorter.sort(workerData.array, workerData.options)
                    .then(result => parentPort.postMessage(result))
                    .catch(error => parentPort.postMessage({ error: error.message }));
            `;

            const worker = new Worker(workerCode, {
                eval: true,
                workerData: {
                    array,
                    options: { ...options, parallel: false } // Desativa paralelismo dentro do worker
                }
            });

            worker.on('message', (result) => {
                if (result.error) {
                    reject(new Error(result.error));
                } else {
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

module.exports = MergeSort;