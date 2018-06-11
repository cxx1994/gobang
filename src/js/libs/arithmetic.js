//冒泡排序
export function bubbleSort(arr, prop) {
    let l = arr.length, j, temp;
    while (l > 0) {
        for (j = 0; j < l - 1; j++) {
            if (arr[j]['score'][prop] > arr[j + 1]['score'][prop]) {
                temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
        l--;
    }
    return arr;
}

//归并算法
export function merge(left, right) {
    let result = [];
    while (left.length > 0 && right.length > 0) {
        if (left[0].total < right[0].total) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }
    return result.concat(left).concat(right);
}

//快速排序(是目前基于比较的内部排序中被认为是最好的方法，当待排序的关键字是随机分布时，快速排序的平均时间最短；)
export const quickSort = (array, prop, left = 0, right = array.length - 1) => {
    let index,
        pivot,
        i = left,
        j = right;
    if (j > 0) {
        pivot = array[~~((left + right) / 2)]['score'][prop];

        while (i <= j) {
            while (array[i]['score'][prop] < pivot) {
                i++;
            }
            while (array[j]['score'][prop] > pivot) {
                j--;
            }
            if (i <= j) {
                [array[i], array[j]] = [array[j], array[i]];
                i++;
                j--;
            }
        }
        index = i;

        if (left < index - 1) {
            quickSort(array, prop, left, index - 1);
        }
        if (index < right) {
            quickSort(array, prop, index, right);
        }
    }
    return array;
};

//深度copy
export const deepCopy = (object1 = {}, object2) => {
    Object.keys(object2).map(field => {
        let type = Object.prototype.toString.call(object2[field]).slice(8, -1);
        object1[field] = object2[field] &&
            type === 'Object' ?
                deepCopy(object1[field], object2[field]) :
                type === 'Array' ?
                    [...object2[field]] :
                    object2[field]
    });
    return object1
};
