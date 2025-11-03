import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Card } from "domain/src/model/types"

export type DiscardPileState = {
  pile: Card[]
}

const init_state: DiscardPileState = {
  pile: []
}

export const discard_pile_slice = createSlice({
  name: 'discard pile',
  initialState: init_state,
  reducers: {
    set: (state: DiscardPileState, action: PayloadAction<Card[]>): DiscardPileState => {
      return { ...state, pile: action.payload }
    },
    addCard: (state: DiscardPileState, action: PayloadAction<Card>): DiscardPileState => {
      return { ...state, pile: [...state.pile, action.payload] }
    },
    clear: (state: DiscardPileState): DiscardPileState => {
      return { ...state, pile: [] }
    }
  }
})