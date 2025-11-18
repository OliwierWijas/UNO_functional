import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { player_hand as createPlayerHand, type PlayerHand } from 'domain/src/model/playerHand';
import { discard_pile as createDiscardPile } from 'domain/src/model/discardPile';
import { round } from 'domain/src/model/round';
import './styles/Game.css';
import type { Dispatch } from '../stores/stores';
import { useDispatch } from 'react-redux';

import * as api from '../model/uno-client';

import OpponentHand from './OpponentHand';
import PlayerHandComponent from './PlayerHand';
import Deck from './Deck';
import TopInfoBar from './TopInfoBar';
import DiscardPile from './DiscardPile';
import { useSelector } from 'react-redux';
import type { State } from '../stores/stores';
import type { OngoingGamesState } from '../slices/ongoing_games_slice';
import LiveUpdateOngoingGame from '../thunks/LiveUpdateOngoingGame';

interface RoundWinner {
  winner: string;
  score: number;
}

const GameContainer: React.FC = () => {
  const query = new URLSearchParams(useLocation().search);
  const gameName = query.get('gameName') || 'DefaultGame';
  const playerName = query.get('playerName') || 'Player';


  const [playerHand] = useState(() => createPlayerHand(playerName));
  const [opponents, setOpponents] = useState<PlayerHand[]>([]);
  const [currentRound, setCurrentRound] = useState(() => round([playerHand]));
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [hasTakenInitialCards, setHasTakenInitialCards] = useState(false);
  const [roundWinner, setRoundWinner] = useState<RoundWinner | null>(null);

  const dispatch: Dispatch = useDispatch();
  
  useEffect(() => {
    if (gameName) {
      dispatch(LiveUpdateOngoingGame(gameName));
    }
  }, [gameName, dispatch]);
  
  const ongoingGame = useSelector<State, OngoingGamesState>(state => state.ongoing_games || []);

  const currentGame = useMemo(() => {
    return ongoingGame.find(g => g.name === gameName);
  }, [ongoingGame, gameName]);

  const canStartGame = useMemo(() => {
    return currentGame
      ? currentGame.rounds[currentGame.currentRoundIndex].playerHands.length > 1 && currentGame.state === "PENDING"
      : false;
  }, [currentGame]);

  /** ----- Helper Functions ----- */
  // const updatePlayerHands = (hands: any[]) => {
  //   const newOpponents: PlayerHand[] = [];

  //   hands.forEach(hand => {
  //     if (hand.playerName === playerName) {
  //       playerHand.cards = hand.playerCards;
  //     } else {
  //       const opponent = createPlayerHand(hand.playerName);
  //       opponent.cards = hand.playerCards;
  //       newOpponents.push(opponent);
  //     }
  //   });

  //   setOpponents(newOpponents);

  //   const allPlayers = [playerHand, ...newOpponents];
  //   const currentPlayer = currentRound.playerHands[currentRound.currentPlayerIndex];
  //   const newRound = round(allPlayers);
  //   newRound.playerHands[newRound.currentPlayerIndex] = currentPlayer;
  //   setCurrentRound(newRound);
  // };

  // /** ----- API Subscriptions ----- */
  // const setupPlayerHandsSubscription = () => {
  //   api.onGamePlayerHandsUpdated(gameName, (hands) => {
  //     playerHandsStore.update(hands);
  //     updatePlayerHands(hands);
  //   });
  // };

  // const setupGameStartedSubscription = () => {
  //   api.onGameStarted(gameName, (game) => {
  //     setGameStarted(true);
  //     ongoingGamesStore.addGame(game);
  //     initializeGameComponents();
  //   });
  // };

  // const setupCurrentPlayerSubscription = () => {
  //   api.onCurrentPlayerUpdated(gameName, (name) => {
  //     currentPlayerStore.set(name);
  //     currentRound.currentPlayer = createPlayerHand(name);
  //   });
  // };

  // const setupDiscardPileSubscription = () => {
  //   api.onDiscardPileUpdated(gameName, (cards) => {
  //     const pile = createDiscardPile();
  //     pile.pile = cards;
  //     discardPileStore.set(pile);
  //   });
  // };

  // const setupRoundWonSubscription = () => {
  //   api.onRoundWon(gameName, (data) => {
  //     if (data.isFinished) {
  //       setRoundWinner({ winner: data.winner, score: data.winnerScore });
  //     }
  //   });
  // };

  /** ----- Game Functions ----- */
  const startGame = async () => {
    if (!canStartGame || isLoading) return;

    try {
      setIsLoading(true);
      await api.start_game(gameName);
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // const initializeGameComponents = async () => {
  //   if (!hasTakenInitialCards) {
  //     const cards = await api.take_cards(gameName, playerHand.playerName, 1);
  //     playerHand.takeCards(cards);
  //     setHasTakenInitialCards(true);
  //   }
  //   currentRound.nextPlayer();
  // };

  // const handleCardDrawn = (card: any) => {
  //   if (!gameStarted || !card) return;
  //   playerHand.takeCards([card]);
  // };

  // const handleCardPlayed = async (payload: { cardIndex: number; card: any }) => {
  //   if (!gameStarted) return;

  //   const canBePut = await api.play_card(gameName, payload.cardIndex);
  //   if (!canBePut) {
  //     playerHand.putCardBack(payload.card, payload.cardIndex);
  //   }
  // };

  const loadInitialPlayerHands = async () => {
    try {
      const initialHands = currentGame?.rounds[currentGame.currentRoundIndex].playerHands
      //updatePlayerHands(initialHands);

      if (currentGame) {
        setGameStarted(true);
        //initializeGameComponents();
      }
    } catch (error) {
      console.error('Error fetching initial player hands:', error);
    }
  };

  // const startNextRound = async () => {
  //   if (!roundWinner) return;
  //   try {
  //     await api.round_won(gameName);
  //     setRoundWinner(null);
  //     const initialHands = await api.get_game_player_hands(gameName);
  //     updatePlayerHands(initialHands);
  //   } catch (err) {
  //     console.error('Failed to start next round:', err);
  //   }
  // };

  /** ----- Lifecycle ----- */
  useEffect(() => {
    loadInitialPlayerHands();
    // setupPlayerHandsSubscription();
    // setupGameStartedSubscription();
    // setupCurrentPlayerSubscription();
    // setupDiscardPileSubscription();
    // setupRoundWonSubscription();
  }, []);

  return (
    <div className="game-container">
      {/* {roundWinner && (
        <RoundWinnerPopup
          winner={roundWinner.winner}
          score={roundWinner.score}
          onNextRound={startNextRound}
        />
      )} */}

      {/* <TopInfoBar /> */}

      {!gameStarted ? (
        <div className="start-game-section">
          <div className="waiting-message">
            <h2>Waiting to Start Game: {gameName}</h2>
            <ul className="player-list">
              {currentGame?.rounds[currentGame.currentRoundIndex].playerHands.map(hand => (
                <li key={hand.playerName}>{hand.playerName}</li>
              ))}
            </ul>

            <button
              onClick={startGame}
              disabled={!canStartGame || isLoading}
              className={`start-game-button ${(!canStartGame || isLoading) ? 'disabled' : ''}`}
            >
              {isLoading ? 'Starting...' : 'Start Game'}
            </button>

            {!canStartGame && <div className="warning-message">Need at least 2 players to start the game</div>}
          </div>
        </div>
      ) : (
        <>
          {/* Opponents */}
          {opponents.length > 0 && (
            <>
              {opponents.length === 1 && <OpponentHand opponent={opponents[0]} className="opponent-left" />}
              {opponents.length === 2 && (
                <>
                  <OpponentHand opponent={opponents[0]} className="opponent-left" />
                  <OpponentHand opponent={opponents[1]} className="opponent-right" />
                </>
              )}
              {opponents.length === 3 && (
                <>
                  <OpponentHand opponent={opponents[0]} className="opponent-left" />
                  <OpponentHand opponent={opponents[1]} className="opponent-right" />
                  <OpponentHand opponent={opponents[2]} className="opponent-top" />
                </>
              )}
              {opponents.length >= 4 && (
                <>
                  <div className="opponent-left column">
                    <OpponentHand opponent={opponents[0]} />
                    <OpponentHand opponent={opponents[1]} />
                  </div>
                  <div className="opponent-right column">
                    <OpponentHand opponent={opponents[2]} />
                    <OpponentHand opponent={opponents[3]} />
                  </div>
                </>
              )}
            </>
          )}

          <div className="center-area">
            <DiscardPile />
            {/* <Deck
              gameName={gameName}
              playerName={playerName}
              //onCardDrawn={handleCardDrawn}
            /> */}
          </div>

          {/* <PlayerHandComponent
            playerHand={playerHand}
            //onCardPlayed={handleCardPlayed}
          /> */}
        </>
      )}
    </div>
  );
};

export default GameContainer;
