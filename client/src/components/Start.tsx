import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import createGameThunk from '../thunks/CreateGameThunk';
import joinGameThunk from '../thunks/JoinGameThunk';
import './styles/Start.css';
import type { PendingGamesState } from '../slices/pending_games_slice';
import type { Dispatch, State } from '../stores/stores'

const Start = () => {
  const [newGameName, setNewGameName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch: Dispatch = useDispatch();
  
  // Get pending games from Redux store
  const pendingGames = useSelector<State, PendingGamesState>(state => state.pending_games || []);

  const canStart = useMemo(() => 
    playerName.trim().length > 0 && newGameName.trim().length > 0, 
    [playerName, newGameName]
  );

  const canJoin = useMemo(() => 
    playerName.trim().length > 0, 
    [playerName]
  );

  const createGame = useCallback(() => {
    if (canStart) {
      // Dispatch the thunk
      dispatch(createGameThunk(newGameName, navigate));
    }
  }, [newGameName, navigate, canStart, dispatch]);

  const joinGame = useCallback((gameName: string) => {
    if (canJoin) {
      dispatch(joinGameThunk(gameName, playerName));
      navigate('/game', { 
            state: { 
              playerName: playerName,
              gameName: gameName
            }
          });
    }
  }, [playerName, dispatch]);


  /*const joinGame = useCallback((gameName: string) => {
    if (canJoin) {
      // For join, we can keep the direct API call or create a thunk
      api.create_player_hand(playerName, gameName)
        .then(() => {
          navigate('/game', { 
            state: { 
              playerName: playerName,
              gameName: gameName
            }
          });
        })
        .catch((error: any) => {
          console.error('Error in joinGame:', error);
          alert("Game has too many players!");
        });
    }
  }, [playerName, navigate, canJoin]);*/

  // Load pending games on component mount

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && canStart) {
      createGame();
    }
  };

  return (
    <div className="start-page">
      <h1 className="title">UNO</h1>
      
      <div className="player-input-container">
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          type="text"
          placeholder="Enter your name"
          className="name-input"
        />
      </div>

      <div className="content-container">
        <div className="games-section">
          <h2 className="section-title">Available Games</h2>
          
          {(isLoading) ? (
            <div className="loading-container">
              <p>Loading games...</p>
            </div>
          ) : pendingGames.length > 0 ? (
            <div className="table-container">
              <table className="games-table">
                <thead>
                  <tr>
                    <th>Game Name</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pendingGames.map((game: any) => (
                    <tr key={game.name}>
                      <td>{game.name}</td>
                      <td>
                        <button
                          className="join-btn"
                          disabled={!canJoin}
                          onClick={() => joinGame(game.name)}
                        >
                          Join Game
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-games">
              <p>No available games. Create one below!</p>
            </div>
          )}
        </div>

        <div className="create-section">
          <h2 className="section-title">Create New Game</h2>
          
          <div className="create-form">
            <input
              value={newGameName}
              onChange={(e) => setNewGameName(e.target.value)}
              onKeyUp={handleKeyPress}
              type="text"
              placeholder="Enter game name"
              className="name-input"
            />

            <button
              className="create-btn"
              disabled={!canStart}
              onClick={createGame}
            >
              Create Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Start;