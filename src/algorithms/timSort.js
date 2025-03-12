const SortStrategy = require("./strategy");

class TimSort extends SortStrategy {
    sort(array) {
        const MIN_MERGE = 32;
        let comparisons = 0;
        let swaps = 0;

        function minRunLength(n) {
            let r = 0;
            while (n >= MIN_MERGE) {
                r |= n & 1;
                n >>= 1;
            }
            return n + r;
        }

        function insertionSort(arr, left, right) {
            for (let i = left + 1; i <= right; i++) {
                const key = arr[i];
                let j = i - 1;
                while (j >= left && arr[j] > key) {
                    comparisons++;
                    arr[j + 1] = arr[j];
                    swaps++;
                    j--;
                }
                arr[j + 1] = key;
            }
        }

        function merge(arr, l, m, r) {
            const len1 = m - l + 1, len2 = r - m;
            const left = arr.slice(l, l + len1);
            const right = arr.slice(m + 1, m + 1 + len2);
            let i = 0, j = 0, k = l;
            while (i < len1 && j < len2) {
                comparisons++;
                if (left[i] <= right[j]) {
                    arr[k++] = left[i++];
                } else {
                    arr[k++] = right[j++];
                }
            }
            while (i < len1) arr[k++] = left[i++];
            while (j < len2) arr[k++] = right[j++];
        }

        const n = array.length;
        const minRun = minRunLength(n);

        for (let i = 0; i < n; i += minRun) {
            insertionSort(array, i, Math.min(i + minRun - 1, n - 1));
        }

        for (let size = minRun; size < n; size = 2 * size) {
            for (let left = 0; left < n; left += 2 * size) {
                const mid = left + size - 1;
                const right = Math.min(left + 2 * size - 1, n - 1);
                if (mid < right) {
                    merge(array, left, mid, right);
                }
            }
        }

        return { sortedArray: array, comparisons, swaps };
    }
}

module.exports = TimSort;