export function flattenTwoDimArray(arr: Array<any>) {
    return arr.reduce((accumulator, currentValue) => accumulator.concat(currentValue), [])
}