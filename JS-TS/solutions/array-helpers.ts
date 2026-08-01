/* eslint-disable @typescript-eslint/no-unused-vars */
// Task 02: Mini functional–utility library
// All helpers are declared but not implemented.

export function mapArray<T, R>(source: readonly T[], mapper: (item: T, index: number) => R): R[] {
  const result : R[] = [];
  for (let i = 0; i < source.length; i++) {
    result.push(mapper(source[i], i));
  }
  return result;
}

export function filterArray<T>(source: readonly T[], predicate: (item: T, index: number) => boolean): T[] {
  const result : T[] = [];
  for (let i = 0; i < source.length; i++) {
    if (predicate(source[i], i)) {
      result.push(source[i]);
    }
  }
  return result;
}

export function reduceArray<T, R>(source: readonly T[], reducer: (acc: R, item: T, index: number) => R, initial: R): R {
  let acc = initial;
  for (let i = 0; i < source.length; i++) {
    acc = reducer(acc, source[i], i);
  }
  return acc;
}

export function partition<T>(source: readonly T[], predicate: (item: T) => boolean): [T[], T[]] {
  const result: [T[], T[]] = [[], []]
  for (let i = 0; i < source.length; i++) {
    if (predicate(source[i])) {
      result[0].push(source[i]);
    } else {
      result[1].push(source[i]);
    }
  }
  return result;
}

export function groupBy<T, K extends PropertyKey>(source: readonly T[], keySelector: (item: T) => K): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (let i = 0; i < source.length; i++) {
    if (!result[keySelector(source[i])]) {
      result[keySelector(source[i])] = [];
    }
    result[keySelector(source[i])].push(source[i]);
  }
  return result;
}
