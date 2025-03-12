const SortStrategy = require("./strategy");

class BubbleSortImproved extends SortStrategy {
    sort(array) {
        let comparisons = 0;
        let swaps = 0;
        let n = array.length;
        let swapped;
        do {
            swapped = false;
            for (let i = 0; i < n - 1; i++) {
                comparisons++;
                if (array[i] > array[i + 1]) {
                    [array[i], array[i + 1]] = [array[i + 1], array[i]];
                    swaps++;
                    swapped = true;
                }
            }
            n--;
        } while (swapped);
        return { sortedArray: array, comparisons, swaps };
    }
}

module.exports = BubbleSortImproved;