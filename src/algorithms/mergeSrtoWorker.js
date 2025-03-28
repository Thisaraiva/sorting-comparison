const { workerData, parentPort } = require('worker_threads');
const MergeSort = require('./mergeSort');

const sorter = new MergeSort();
const { arr, depth } = workerData;

sorter.parallelMergeSort(arr, depth)
    .then(result => {
        parentPort.postMessage(result);
    });