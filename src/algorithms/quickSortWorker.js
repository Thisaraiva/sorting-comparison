const { workerData, parentPort } = require('worker_threads');
const QuickSort = require('./quickSort');

const sorter = new QuickSort();
const { arr, depth } = workerData;

sorter.parallelQuickSort(arr, depth)
    .then(result => {
        parentPort.postMessage(result);
    });