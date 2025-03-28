const SortStrategy = require("./strategy");
const { Worker } = require('worker_threads');
const path = require('path');

class MergeSort extends SortStrategy {
    async sort(array) {
        return this.parallelMergeSort(array);
    }

    async parallelMergeSort(array, depth = 0) {
        if (array.length <= 10000) {
            return this.sequentialMergeSort(array);
        }

        const mid = Math.floor(array.length / 2);
        const left = array.slice(0, mid);
        const right = array.slice(mid);

        // Paraleliza apenas nos primeiros níveis de recursão
        if (depth < 2) {
            const [leftResult, rightResult] = await Promise.all([
                this.sortInWorker(left, depth + 1),
                this.sortInWorker(right, depth + 1)
            ]);

            return this.merge(leftResult, rightResult);
        } else {
            const leftResult = await this.parallelMergeSort(left, depth + 1);
            const rightResult = await this.parallelMergeSort(right, depth + 1);

            return this.merge(leftResult, rightResult);
        }
    }

    async sortInWorker(array, depth) {
        return new Promise((resolve) => {
            const worker = new Worker(path.join(__dirname, './mergeSortWorker.js'), {
                workerData: {
                    arr: array,
                    depth
                }
            });
            worker.on('message', resolve);
        });
    }

    sequentialMergeSort(array) {
        this.comparisons = 0;
        this.swaps = 0;
        
        const sortedArray = this._mergeSort(array);
        return {
            sortedArray,
            comparisons: this.comparisons,
            swaps: this.swaps
        };
    }

    _mergeSort(arr) {
        if (arr.length <= 1) {
            return arr;
        }

        const mid = Math.floor(arr.length / 2);
        const left = this._mergeSort(arr.slice(0, mid));
        const right = this._mergeSort(arr.slice(mid));

        return this._merge(left, right);
    }

    _merge(left, right) {
        let result = [];
        let i = 0, j = 0;

        while (i < left.length && j < right.length) {
            this.comparisons++;
            if (left[i] <= right[j]) {
                result.push(left[i++]);
                this.swaps++;
            } else {
                result.push(right[j++]);
                this.swaps++;
            }
        }

        while (i < left.length) {
            result.push(left[i++]);
            this.swaps++;
        }

        while (j < right.length) {
            result.push(right[j++]);
            this.swaps++;
        }

        return result;
    }

    merge(leftResult, rightResult) {
        const merged = this._merge(leftResult.sortedArray, rightResult.sortedArray);
        return {
            sortedArray: merged,
            comparisons: leftResult.comparisons + rightResult.comparisons + this.comparisons,
            swaps: leftResult.swaps + rightResult.swaps + this.swaps
        };
    }
}

module.exports = MergeSort;