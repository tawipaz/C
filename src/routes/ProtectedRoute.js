// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ user, authLoading }) {
  console.log("ProtectedRoute: Rendering - user:", user, "authLoading:", authLoading);
  if (authLoading) {
    console.log("ProtectedRoute: authLoading is true, returning null.");
    return null; // Or a loading spinner
  }
  if (!user) {
    console.log("ProtectedRoute: user is null, navigating to /auth.");
    return <Navigate to="/auth" replace />;
  }
  console.log("ProtectedRoute: user is present, rendering Outlet.");
  return <Outlet />;
}
