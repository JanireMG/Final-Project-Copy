import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import Home from './Components/Pages/Home';
import SearchbarContent from './Components/Pages/SearchbarContent';
import AnimeInfo from './Components/Pages/AnimeInfo';

import './style/main.scss';
import Login from './Components/Auth/login.jsx';
import UserPanel from './Components/Pages/UserPanel.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {path: '', element: <Home /> },
      {path: 'search', element: <SearchbarContent />},
      {path: 'anime-info', element: <AnimeInfo /> },
      {path: 'login', element: <Login />},
      {path: 'register', element: <Login /> },
      {path: 'user-panel', element: <UserPanel /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
