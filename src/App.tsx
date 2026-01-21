import React from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { Home } from './pages/Home';

const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/category/:categoryId",
    element: <Home />,
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
