export type Randomizer = (bound: number) => number

export const standardRandomizer: Randomizer = (n) => Math.floor(Math.random() * n)

export type Shuffler<T> = (ts: T[]) => T[]

export function standardShuffler<T>(ts: T[]): T[] {
  const copy = [...ts]
  for (let i = 0; i < copy.length - 1; i++) {
    const j = Math.floor(Math.random() * (copy.length - i) + i)
    const temp = copy[j]
    copy[j] = copy[i]
    copy[i] = temp
  }
  return copy
}