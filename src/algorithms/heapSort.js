const SortStrategy = require("./strategy");

class HeapSort extends SortStrategy {
    sort(array) {
        let comparisons = 0;
        let swaps = 0;

        function heapify(arr, n, i) {
            let largest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;

            if (left < n && arr[left] > arr[largest]) {
                largest = left;
            }
            if (right < n && arr[right] > arr[largest]) {
                largest = right;
            }
            comparisons += 2;

            if (largest !== i) {
                [arr[i], arr[largest]] = [arr[largest], arr[i]];
                swaps++;
                heapify(arr, n, largest);
            }
        }

        const n = array.length;
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            heapify(array, n, i);
        }

        for (let i = n - 1; i > 0; i--) {
            [array[0], array[i]] = [array[i], array[0]];
            swaps++;
            heapify(array, i, 0);
        }

        return { sortedArray: array, comparisons, swaps };
    }
}

module.exports = HeapSort;