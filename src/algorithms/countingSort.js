const SortStrategy = require("./strategy");

class CountingSort extends SortStrategy {
    sort(array) {
        let comparisons = 0;
        let swaps = 0;

        // 1. Encontrar o valor máximo no array (cada iteração é uma comparação)
        let max = array[0];
        for (let i = 1; i < array.length; i++) {
            comparisons++; // Comparação entre array[i] e max
            if (array[i] > max) {
                max = array[i];
            }
        }

        const count = new Array(max + 1).fill(0);
        const output = new Array(array.length);

        // 2. Preenchendo o array de contagem (sem comparações)
        for (let num of array) {
            count[num]++;
        }

        // 3. Construção do array acumulado (comparações entre índices)
        for (let i = 1; i <= max; i++) {
            comparisons++; // Comparação entre i e max
            count[i] += count[i - 1];
        }

        // 4. Construção do array ordenado (cada iteração envolve busca no count[])
        for (let i = array.length - 1; i >= 0; i--) {
            output[count[array[i]] - 1] = array[i];
            count[array[i]]--;
            swaps++; // Conta como "troca" quando um elemento é colocado na posição correta
        }

        return { sortedArray: output, comparisons, swaps };
    }
}

module.exports = CountingSort;
