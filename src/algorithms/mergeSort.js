const SortStrategy = require("./strategy");

class MergeSort extends SortStrategy {
    sort(array) {
        let comparisons = 0;
        let swaps = 0;

        function merge(left, right) {
            let result = [];
            let i = 0, j = 0;

            while (i < left.length && j < right.length) {
                comparisons++;
                if (left[i] <= right[j]) {
                    result.push(left[i++]);
                    swaps++; // Conta a movimentação de um elemento de left para o resultado
                } else {
                    result.push(right[j++]);
                    swaps++; // Conta a movimentação de um elemento de right para o resultado
                }
            }

            // Adiciona os elementos restantes de left (se houver)
            while (i < left.length) {
                result.push(left[i++]);
                swaps++; // Conta a movimentação de um elemento de left para o resultado
            }

            // Adiciona os elementos restantes de right (se houver)
            while (j < right.length) {
                result.push(right[j++]);
                swaps++; // Conta a movimentação de um elemento de right para o resultado
            }

            return result;
        }

        function mergeSort(arr) {
            if (arr.length <= 1) {
                return arr;
            }

            const mid = Math.floor(arr.length / 2);
            const left = mergeSort(arr.slice(0, mid));
            const right = mergeSort(arr.slice(mid));

            return merge(left, right);
        }

        const sortedArray = mergeSort(array);
        return { sortedArray, comparisons, swaps };
    }
}

module.exports = MergeSort;