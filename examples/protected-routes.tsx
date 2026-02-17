import React from 'react';
import { useAuth } from '@aerostack/react';
// Assuming React Router usage
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Protected Route Example
 * 
 * Demonstrates a reusable ProtectedRoute component.
 */

export const ProtectedRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading authentication...</div>;
    }

    if (!user) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    // Render child routes if authenticated
    return <Outlet />;
};

// Usage in App.tsx:
/*
<Routes>
  <Route path="/login" element={<LoginPage />} />
  
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Route>
</Routes>
*/
