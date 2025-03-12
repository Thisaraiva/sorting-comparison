const SortStrategy = require("./strategy");

class BubbleSort extends SortStrategy {
    sort(array) {
        let comparisons = 0;
        let swaps = 0;
        let n = array.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                comparisons++;
                if (array[j] > array[j + 1]) {
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                    swaps++;
                }
            }
        }
        return { sortedArray: array, comparisons, swaps };
    }
}

module.exports = BubbleSort;