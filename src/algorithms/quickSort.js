const SortStrategy = require("./strategy");

class QuickSort extends SortStrategy {
    sort(array) {
        let comparisons = 0;
        let swaps = 0;

        function partition(arr, low, high) {
            const pivot = arr[high];
            let i = low - 1;
            for (let j = low; j < high; j++) {
                comparisons++;
                if (arr[j] < pivot) {
                    i++;
                    if (i !== j) { // Evita troca desnecessária
                        [arr[i], arr[j]] = [arr[j], arr[i]];
                        swaps++;
                    }
                }
            }
            if (i + 1 !== high) { // Evita troca desnecessária do pivô
                [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
                swaps++;
            }
            return i + 1;
        }

        function quickSort(arr, low, high) {
            if (low < high) {
                const pi = partition(arr, low, high);
                quickSort(arr, low, pi - 1);
                quickSort(arr, pi + 1, high);
            }
        }

        quickSort(array, 0, array.length - 1);
        return { sortedArray: array, comparisons, swaps };
    }
}


module.exports = QuickSort;