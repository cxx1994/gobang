
//冒泡排序
function bubbleSort(arr, prop){
    let l = arr.length, j, temp;
    while (l > 0){
        for(j = 0; j < l - 1; j++){
            if(arr[j]['score'][prop] > arr[j + 1]['score'][prop]){
                temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
        l--;
    }
    return arr;
}
//快速排序(是目前基于比较的内部排序中被认为是最好的方法，当待排序的关键字是随机分布时，快速排序的平均时间最短；)
function  quickSort(array, prop){
    //一次排序，将数组的第一个元素放置在左边元素都比其小右边元素都比其大的位置
    function sort(prev, numsize){
        let nonius = prev,
            j = numsize - 1,
            flag = array[prev];
        //一次排序的数组长度要大于1
        if ((numsize - prev) > 1) {
            while(nonius < j){
                for(; nonius < j; j--){
                    //在数组右边查找比当前排序元素小的值
                    if (array[j]['score'][prop] < flag['score'][prop]) {
                        array[nonius++] = array[j];
                        break;
                    }
                }
                for(; nonius < j; nonius++){
                    //在数组左边查找比当前排序元素大的值
                    if (array[nonius]['score'][prop] > flag['score'][prop]){
                        array[j--] = array[nonius];
                        break;
                    }
                }
            }
            //一次排序完成
            array[nonius] = flag;
            //对已经完成排序元素的左边元素和右边元素分别再进行排序
            sort(0, nonius);
            sort(nonius + 1, numsize);
        }
    }
    sort(0, array.length);
    return array;
}

//归并算法
function merge(left, right) {
    let　result = [];
    while(left.length > 0 && right.length > 0){
        if(left[0].total < right[0].total){
            result.push(left.shift());
        }else{
            result.push(right.shift());
        }
    }
    return　result.concat(left).concat(right);
}

export {quickSort, bubbleSort, merge};
