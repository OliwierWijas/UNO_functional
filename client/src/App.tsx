import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomeView from "./views/HomeView.tsx";
import GamePage from "./components/GamePage.tsx";
import About from "./views/AboutView.tsx";
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import InitialGamesThunk from './thunks/InitialGamesThunk.ts';
import type { Dispatch } from './stores/stores';
import LiveUpdatePendingGames from './thunks/LiveUpdatePendingGames.ts';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeView />,
  },
  {
    path: '/game',
    element: <GamePage />,
  },
  {
    path: '/about',
    element: <About />,
  },
]);

function App() {
  const dispatch: Dispatch = useDispatch()
  useEffect(() => {
      dispatch(InitialGamesThunk())
      dispatch(LiveUpdatePendingGames)
  }, [])

  return <RouterProvider router={router} />;
}

export default App;