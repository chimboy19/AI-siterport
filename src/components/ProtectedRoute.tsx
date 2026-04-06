import React from 'react'
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import LoadingSpinner from './LoadingSpinner';
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();
  const { lang = 'en' } = useParams<{ lang: string }>();


if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/${lang}/auth`} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute
