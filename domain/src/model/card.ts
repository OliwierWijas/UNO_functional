// card_factories.ts
import _ from 'lodash';
import { Record } from 'immutable';
import type { Color, Digit, Type, Card } from "./types"

interface NumberedCardProps {
  readonly type: 'NUMBERED'
  readonly color: Color
  readonly number: Digit
}

interface ActionCardProps {
  readonly type: 'SKIP' | 'REVERSE' | 'DRAW2'
  readonly color: Color
}

interface WildCardProps {
  readonly type: 'WILD' | 'DRAW4'
}

const NumberedCardRecord = Record<NumberedCardProps>({
  type: 'NUMBERED',
  color: 'RED',
  number: 1
} as NumberedCardProps);

const ActionCardRecord = Record<ActionCardProps>({
  type: 'SKIP',
  color: 'RED'
} as ActionCardProps);

const WildCardRecord = Record<WildCardProps>({
  type: 'WILD'
} as WildCardProps);

export function numbered_card(color: Color, number: Digit): Card {
  return { type: 'NUMBERED', color, number };
}

export function action_card<T extends Extract<Type, 'SKIP' | 'REVERSE' | 'DRAW2'>>(
  type: T, 
  color: Color
): Card {
  return { type, color };
}

export function wild_card<T extends Extract<Type, 'WILD' | 'DRAW4'>>(type: T): Card {
  return { type };
}

export function immutable_numbered_card(color: Color, number: Digit): Record<NumberedCardProps> {
  return NumberedCardRecord({ color, number });
}

export function immutable_action_card<T extends Extract<Type, 'SKIP' | 'REVERSE' | 'DRAW2'>>(
  type: T, 
  color: Color
): Record<ActionCardProps> {
  return ActionCardRecord({ type, color });
}

export function immutable_wild_card<T extends Extract<Type, 'WILD' | 'DRAW4'>>(type: T): Record<WildCardProps> {
  return WildCardRecord({ type });
}