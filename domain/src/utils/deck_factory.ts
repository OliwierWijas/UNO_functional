import type { Card } from "../model/types"
import type { Color, Digit } from "../model/types"
import { standardShuffler } from "./random_utils"

const DIGITS: readonly Digit[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const
const COLORS: Color[] = ['BLUE', 'RED', 'GREEN', 'YELLOW']

function create_numbered_cards(color: Color): Card[] {
  return [
    ...DIGITS.map((n) => ({ type: 'NUMBERED' as const, color, number: n })),
    ...DIGITS.slice(1).map((n) => ({ type: 'NUMBERED' as const, color, number: n })),
  ]
}

function create_typed_cards(type: 'SKIP' | 'REVERSE' | 'DRAW2', color: Color, count: number): Card[] {
  return Array.from({ length: count }, () => ({ type, color }))
}

function create_wild_cards(type: 'WILD' | 'DRAW4', count: number): Card[] {
  return Array.from({ length: count }, () => ({ type }))
}

export function create_full_deck(): Card[] {
  const typed_types: ('SKIP' | 'REVERSE' | 'DRAW2')[] = ['SKIP', 'REVERSE', 'DRAW2']
  const wild_types: ('WILD' | 'DRAW4')[] = ['WILD', 'DRAW4']

  const cards = [
    ...COLORS.flatMap(create_numbered_cards),
    ...typed_types.flatMap((type) =>
      COLORS.flatMap((color) => create_typed_cards(type, color, 2))
    ),
    ...wild_types.flatMap((type) => create_wild_cards(type, 4)),
  ]

  return standardShuffler(cards)
}