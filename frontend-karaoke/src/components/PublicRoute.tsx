import { Navigate } from "react-router-dom";
import type { JSX } from "react/jsx-dev-runtime";

function PublicRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;