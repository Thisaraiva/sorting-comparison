const SortStrategy = require("./strategy");

class InsertionSort extends SortStrategy {
    sort(array) {
        let comparisons = 0;
        let swaps = 0;

        for (let i = 1; i < array.length; i++) {
            let key = array[i];
            let j = i - 1;
            while (j >= 0 && array[j] > key) {
                comparisons++;
                array[j + 1] = array[j];
                swaps++;
                j--;
            }
            comparisons++; // Conta a comparação que fez o loop parar
            array[j + 1] = key;
        }

        return { sortedArray: array, comparisons, swaps };
    }
}


module.exports = InsertionSort;