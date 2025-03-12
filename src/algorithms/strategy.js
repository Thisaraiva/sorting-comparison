/*// src/algorithms/strategy.js
const bubbleSort = require('./bubbleSort');
const bubbleSortImproved = require('./bubbleSortImproved');
const insertionSort = require('./insertionSort');
const selectionSort = require('./selectionSort');
const quickSort = require('./quickSort');
const mergeSort = require('./mergeSort');
const timSort = require('./timSort');
const heapSort = require('./heapSort');
const countingSort = require('./countingSort');
const radixSort = require('./radixSort');
const shellSort = require('./shellSort');

class SortingStrategy {
    constructor(algorithm) {
        this.algorithm = algorithm;
    }

    sort(data) {
        return this.algorithm(data);
    }
}

module.exports = {
    SortingStrategy,
    bubbleSort,
    bubbleSortImproved,
    insertionSort,
    selectionSort,
    quickSort,
    mergeSort,
    timSort,
    heapSort,
    countingSort,
    radixSort,
    shellSort,
};*/


// src/algorithms/strategy.js
class SortStrategy {
    sort(array) {
        throw new Error("Método sort() deve ser implementado!");
    }
}

module.exports = SortStrategy;