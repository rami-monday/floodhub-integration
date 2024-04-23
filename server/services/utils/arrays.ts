export function splitArrays(largeArray: any[], limit: number) {
  let smallerArrays: any[][] = [];
  for (let i = 0; i < largeArray.length; i += limit) {
    smallerArrays.push(largeArray.slice(i, i + limit));
  }
  return smallerArrays;
}
