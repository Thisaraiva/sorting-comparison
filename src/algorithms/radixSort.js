const SortStrategy = require("./strategy");

class RadixSort extends SortStrategy {
    sort(array) {
        let comparisons = 0;
        let swaps = 0;

        function getMax(arr) {
            let max = arr[0];
            for (let i = 1; i < arr.length; i++) {
                comparisons++; // Comparação entre arr[i] e max
                if (arr[i] > max) {
                    max = arr[i];
                }
            }
            return max;
        }

        function countingSort(arr, exp) {
            const n = arr.length;
            const output = new Array(n);
            const count = new Array(10).fill(0);

            // Contagem da frequência dos dígitos
            for (let i = 0; i < n; i++) {
                let digit = Math.floor(arr[i] / exp) % 10;
                count[digit]++;
            }

            // Ajuste das posições acumuladas
            for (let i = 1; i < 10; i++) {
                comparisons++; // Comparação entre i e 10
                count[i] += count[i - 1];
            }

            // Construção do array ordenado
            for (let i = n - 1; i >= 0; i--) {
                let digit = Math.floor(arr[i] / exp) % 10;
                output[count[digit] - 1] = arr[i];
                count[digit]--;
                swaps++; // Contando como troca ao colocar no output
            }

            // Copiando de volta para o array original
            for (let i = 0; i < n; i++) {
                arr[i] = output[i];
            }
        }

        const max = getMax(array);
        for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
            countingSort(array, exp);
        }

        return { sortedArray: array, comparisons, swaps };
    }
}

module.exports = RadixSort;
