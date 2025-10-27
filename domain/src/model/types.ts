export type State = "PENDING" | "STARTED" | "FINISHED";
export type Type = 'NUMBERED' | 'SKIP' | 'REVERSE' | 'DRAW2' | 'WILD' | 'DRAW4'
export type Color = 'BLUE' | 'GREEN' | 'RED' | 'YELLOW'
export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type Card = 
  | { readonly type: 'NUMBERED', readonly color: Color, readonly number: Digit }
  | { readonly type: 'SKIP' | 'REVERSE' | 'DRAW2', readonly color: Color }
  | { readonly type: 'WILD' | 'DRAW4' }