import { ApolloClient, gql, InMemoryCache, type DocumentNode, HttpLink, ApolloLink } from "@apollo/client/core";
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import * as _ from 'lodash/fp'
import { subscriptionsRxJS } from "./rxjs";
import type { Game } from "../slices/ongoing_games_slice";
import type { SimpleGameDTO } from "../slices/pending_games_slice";
import { map_card } from "domain/src/utils/card_mapper"
import type { Card } from "domain/src/model/types";

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:4000/graphql',
}))

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
})

const splitLink = ApolloLink.split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink,
)

const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
})

async function query(query: DocumentNode, variables?: object): Promise<unknown> {
  const result = await apolloClient.query({ query, variables, fetchPolicy: 'network-only' })    
  return result.data
}  

async function mutate(mutation: DocumentNode, variables?: object): Promise<unknown> {
  const result = await apolloClient.mutate({ mutation, variables, fetchPolicy: 'network-only' })    
  return result.data
}  

// Subscription RxJS methods - following your teacher's pattern
export async function pendingGamesRxJS() {
  const pendingGamesSubscription = gql`
    subscription PendingGamesSubscription {
      pending_games_updated {
        name
      }
    }`
  
  const extractor = (data: { pending_games_updated: SimpleGameDTO[] }) => data.pending_games_updated
  return subscriptionsRxJS(apolloClient, pendingGamesSubscription, extractor)
}

export async function gameStartedRxJS(gameName: string) {
  const gameStartedSubscription = gql`
    subscription GameStartedSubscription($gameName: String!) {
      game_started(gameName: $gameName) {
        name
        state
        playerHands {
          playerName
          cards
          score
        }
      }
    }`

  const extractor = (data: { game_started: Game }) => data.game_started
  return subscriptionsRxJS(apolloClient, gameStartedSubscription, extractor, { gameName })
}

export async function currentPlayerRxJS(gameName: string) {
  const currentPlayerSubscription = gql`
    subscription CurrentPlayerUpdated($gameName: String!) {
      current_player_updated(gameName: $gameName)
    }`

  const extractor = (data: { current_player_updated: string }) => data.current_player_updated
  return subscriptionsRxJS(apolloClient, currentPlayerSubscription, extractor, { gameName })
}

export async function discardPileRxJS(gameName: string) {
  const discardPileSubscription = gql`
    subscription DiscardPileUpdated($gameName: String!) {
      discard_pile_updated(gameName: $gameName) {
        color
        digit
        type
      }
    }`

  const extractor = (data: { discard_pile_updated: any[] }) => data.discard_pile_updated.map(map_card)
  return subscriptionsRxJS(apolloClient, discardPileSubscription, extractor, { gameName })
}

export async function roundWonRxJS(gameName: string) {
  const roundWonSubscription = gql`
    subscription RoundWonSubscription($gameName: String!) {
      round_won(gameName: $gameName) {
        isFinished
        winner
        winnerScore
      }
    }`

  const extractor = (data: { round_won: { isFinished: boolean; winner: string; winnerScore: number } }) => data.round_won
  return subscriptionsRxJS(apolloClient, roundWonSubscription, extractor, { gameName })
}

export async function get_pending_games(): Promise<SimpleGameDTO[]> {
  const response = await query(gql`
    query GetPendingGames {
      get_pending_games {
        name
      }
    }
  `) as { get_pending_games: SimpleGameDTO[] }
  
  return response.get_pending_games
}

export async function create_game(name: string): Promise<Game> {
  const response = await mutate(gql`
    mutation CreateGame($name: String!) {
      create_game(game: { name: $name }) {
        name
      }
    }
  `, { name }) as { create_game: Game }

  return response.create_game
}

export async function start_game(gameName: string): Promise<Game> {
  const response = await mutate(gql`
    mutation StartGame($gameName: String!) {
      start_game(gameName: $gameName) {
        name
        state
        playerHands {
          playerName
          cards
          score
        }
      }
    }
  `, { gameName }) as { start_game: Game }

  return response.start_game
}

export async function take_cards(gameName: string, playerName: string, numberOfCards: number): Promise<Card[]> {
  const response = await mutate(gql`
    mutation TakeCards($gameName: String!, $playerName: String!, $numberOfCards: Int!) {
      take_cards(takeCardsDTO: {
        gameName: $gameName,
        playerName: $playerName,
        numberOfCards: $numberOfCards
      }) {
        color
        digit
        type
      }
    }
  `, { gameName, playerName, numberOfCards }) as { take_cards: any[] }

  if (!response.take_cards) {
    throw new Error("Server Error: No cards returned")
  }

  return response.take_cards.map(map_card)
}

export async function play_card(gameName: string, index: number): Promise<boolean> {
  const response = await mutate(gql`
    mutation PlayCard($gameName: String!, $index: Int!) {
      play_card(playCard: {
        gameName: $gameName,
        index: $index,
      })
    }
  `, { gameName, index }) as { play_card: boolean }

  return response.play_card
}