
import type { Card } from '../model/types'
import type { PlayerHand } from '../model/playerHand'
import type { Round } from '../model/round'

export function can_be_put_on_top(topCard: Card | undefined, chosenCard: Card): boolean {
  if (topCard === undefined) {
    return true
  }

  if (chosenCard.type === 'WILD' || chosenCard.type === 'DRAW4') {
    return true
  }

  if (topCard.type === 'WILD' || topCard.type === 'DRAW4') {
    return true
  }

  if ('color' in chosenCard && 'color' in topCard && chosenCard.color === topCard.color) {
    return true
  }

  switch (topCard.type) {
    case 'NUMBERED':
      return chosenCard.type === 'NUMBERED' && chosenCard.number === topCard.number

    case 'SKIP':
    case 'REVERSE':
      return chosenCard.type === topCard.type

    default:
      return false
  }
}

export function can_say_uno(playerHand: PlayerHand): boolean {
  return playerHand.cards.size === 1
}

export function calculate_score(hands: PlayerHand[]): number {
  return hands.reduce((total, hand) => 
    total + hand.cards.reduce((sum, card) => {
      switch (card.type) {
        case 'NUMBERED':
          return sum + card.number
        case 'DRAW2':
        case 'REVERSE':
        case 'SKIP':
          return sum + 20
        case 'WILD':
        case 'DRAW4':
          return sum + 50
        default:
          return sum
      }
    }, 0)
  , 0)
}

export function has_score_500(round: Round): PlayerHand | undefined {
  return round.playerHands.find(p => p.score >= 500)
}