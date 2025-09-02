// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ isAuthed, children }) {
  if (!isAuthed) return <Navigate to="/auth" replace />;
  return children;
}
