export function flattenTwoDimArray(arr) {
    return arr.reduce((accumulator, currentValue) => accumulator.concat(currentValue), []);
}
