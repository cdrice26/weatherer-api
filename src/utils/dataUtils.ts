/**
 * Represents an object where each key maps to an array of type T.
 *
 * @template T - The type of the elements in the arrays.
 */
type DataObject<T> = {
  [key: string]: T[]; // Allows any key with an array of type T as its value
};

/**
 * Represents an object where each key maps to a single value of type T.
 *
 * @template T - The type of the values in the resulting object.
 */
type ResultObject<T> = {
  [key: string]: T; // Each object in the resulting array will have the same keys as the input
};

/**
 * Converts a data object with arrays into an array of objects.
 *
 * @template T - The type of the elements in the input arrays.
 * @param {DataObject<T>} data - The input data object where each key maps to an array of type T.
 * @returns {ResultObject<T>[]} - An array of objects where each object contains the same keys as the input and the corresponding values from the arrays.
 */
export function convertToArrayOfObjects<T>(
  data: DataObject<T>
): ResultObject<T>[] {
  // Get the keys from the data object
  const keys = Object.keys(data);

  // Determine the length of the arrays (assuming all arrays are of the same length)
  const length = data[keys[0]].length;

  // Create an array of objects
  const result: ResultObject<T>[] = Array.from({ length }, (_, index) => {
    const obj: ResultObject<T> = {};
    keys.forEach((key) => {
      obj[key] = data[key][index];
    });
    return obj;
  });

  return result;
}
