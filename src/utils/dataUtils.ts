export function zip<
  const Names extends readonly string[],
  const Values extends readonly unknown[][]
>(
  names: Names,
  ...arrays: Values
): Array<{ [K in keyof Names & number as Names[K]]: Values[K][number] }> {
  const minLength = Math.min(...arrays.map((arr) => arr.length));

  return Array.from({ length: minLength }, (_, index) => {
    const entry = {} as {
      [K in keyof Names & number as Names[K]]: Values[K][number];
    };
    for (let i = 0; i < names.length; i++) {
      entry[names[i]] = arrays[i][index];
    }
    return entry;
  });
}
