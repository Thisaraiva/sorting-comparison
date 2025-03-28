const SortStrategy = require("./strategy");
const { Worker } = require('worker_threads');
const path = require('path');

class QuickSort extends SortStrategy {
    async sort(array) {
        return this.parallelQuickSort(array);
    }

    async parallelQuickSort(array, depth = 0) {
        if (array.length <= 10000) {
            return this.sequentialQuickSort(array);
        }

        const pivotIndex = this.partition(array, 0, array.length - 1);
        const left = array.slice(0, pivotIndex);
        const right = array.slice(pivotIndex + 1);

        // Paraleliza apenas nos primeiros níveis de recursão
        if (depth < 2) {
            const [leftResult, rightResult] = await Promise.all([
                this.sortInWorker(left, depth + 1),
                this.sortInWorker(right, depth + 1)
            ]);

            return {
                sortedArray: [...leftResult.sortedArray, array[pivotIndex], ...rightResult.sortedArray],
                comparisons: leftResult.comparisons + rightResult.comparisons + this.comparisons,
                swaps: leftResult.swaps + rightResult.swaps + this.swaps
            };
        } else {
            const leftResult = await this.parallelQuickSort(left, depth + 1);
            const rightResult = await this.parallelQuickSort(right, depth + 1);

            return {
                sortedArray: [...leftResult.sortedArray, array[pivotIndex], ...rightResult.sortedArray],
                comparisons: leftResult.comparisons + rightResult.comparisons + this.comparisons,
                swaps: leftResult.swaps + rightResult.swaps + this.swaps
            };
        }
    }

    async sortInWorker(array, depth) {
        return new Promise((resolve) => {
            const worker = new Worker(path.join(__dirname, './quickSortWorker.js'), {
                workerData: {
                    arr: array,
                    depth
                }
            });
            worker.on('message', resolve);
        });
    }

    sequentialQuickSort(array) {
        this.comparisons = 0;
        this.swaps = 0;
        
        const result = this._quickSort(array, 0, array.length - 1);
        return {
            sortedArray: result.array,
            comparisons: this.comparisons,
            swaps: this.swaps
        };
    }

    _quickSort(array, low, high) {
        if (low < high) {
            const pi = this.partition(array, low, high);
            this._quickSort(array, low, pi - 1);
            this._quickSort(array, pi + 1, high);
        }
        return { array };
    }

    partition(array, low, high) {
        const pivot = array[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
            this.comparisons++;
            if (array[j] < pivot) {
                i++;
                if (i !== j) {
                    [array[i], array[j]] = [array[j], array[i]];
                    this.swaps++;
                }
            }
        }
        if (i + 1 !== high) {
            [array[i + 1], array[high]] = [array[high], array[i + 1]];
            this.swaps++;
        }
        return i + 1;
    }
}

module.exports = QuickSort;