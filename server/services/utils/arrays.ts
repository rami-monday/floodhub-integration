export function splitArrays<T>(largeArray: T[], limit: number) {
  let smallerArrays: T[][] = [];
  for (let i = 0; i < largeArray.length; i += limit) {
    smallerArrays.push(largeArray.slice(i, i + limit));
  }
  return smallerArrays;
}
