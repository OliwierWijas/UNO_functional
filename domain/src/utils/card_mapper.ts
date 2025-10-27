import type { Card } from "../model/types"
import { Color, Digit, Type } from "../model/types"

export function map_card(card_data: { 
  type: string; 
  color?: string; 
  digit?: number | null 
}): Card {
  const type = card_data.type as Type

  switch (type) {
    case 'NUMBERED':
      if (card_data.color === undefined) {
        throw new Error("Missing color for NUMBERED card")
      }
      if (card_data.digit === undefined || card_data.digit === null) {
        throw new Error("Missing digit for NUMBERED card")
      }
      if (!is_valid_digit(card_data.digit)) {
        throw new Error(`Invalid digit for NUMBERED card: ${card_data.digit}`)
      }
      return {
        type: 'NUMBERED',
        color: card_data.color as Color,
        number: card_data.digit as Digit,
      }
      
    case 'SKIP':
    case 'REVERSE':
    case 'DRAW2':
      if (card_data.color === undefined) {
        throw new Error(`Missing color for ${type} card`)
      }
      return {
        type,
        color: card_data.color as Color,
      }
      
    case 'WILD':
    case 'DRAW4':
      return {
        type,
      }
      
    default:
      throw new Error(`Unknown card type: ${type}`)
  }
}

function is_valid_digit(value: number): value is Digit {
  return value >= 0 && value <= 9 && Number.isInteger(value)
}