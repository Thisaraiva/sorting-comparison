const SortStrategy = require("./strategy");

class SelectionSort extends SortStrategy {
    sort(array) {
        let comparisons = 0;
        let swaps = 0;
        for (let i = 0; i < array.length - 1; i++) {
            let minIndex = i;
            for (let j = i + 1; j < array.length; j++) {
                comparisons++;
                if (array[j] < array[minIndex]) {
                    minIndex = j;
                }
            }
            if (minIndex !== i) {
                [array[i], array[minIndex]] = [array[minIndex], array[i]];
                swaps++;
            }
        }
        return { sortedArray: array, comparisons, swaps };
    }
}

module.exports = SelectionSort;