const SortStrategy = require("./strategy");

class ShellSort extends SortStrategy {
    sort(array) {
        let comparisons = 0;
        let swaps = 0;
        const n = array.length;

        for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
            for (let i = gap; i < n; i++) {
                const temp = array[i];
                let j;
                for (j = i; j >= gap && array[j - gap] > temp; j -= gap) {
                    comparisons++;
                    array[j] = array[j - gap];
                    swaps++;
                }
                array[j] = temp;
            }
        }

        return { sortedArray: array, comparisons, swaps };
    }
}

module.exports = ShellSort;