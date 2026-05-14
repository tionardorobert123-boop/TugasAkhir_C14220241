import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import {
  useEffect
} from 'react';

import {
  useCloud
} from './context/CloudContext';

import {
  syncAll
} from './lib/sync';

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import TransactionsPage from "./pages/TransactionsPage";
import AccessLogPage from "./pages/AccessLogPage";

function App() {

  const {
    cloudOnline
  } = useCloud();

  useEffect(() => {

    if (cloudOnline) {

      syncAll(
        cloudOnline
      );
    }

  }, [cloudOnline]);

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={<TransactionsPage />}
        />

        <Route
          path="/access-log"
          element={<AccessLogPage />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;