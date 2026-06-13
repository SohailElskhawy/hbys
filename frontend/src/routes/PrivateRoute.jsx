import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'


const PrivateRoute = ({ children, roles = [] }) => { // children = the page im protectin
    // check if user exist then get him access to dashboard 
    const { loading, user } = useAuth()

    if (loading) return <h2>Loading...</h2>;
    if (!user) return <Navigate to={'/login'} replace />
    if (roles.length > 0 && !roles.includes(user.rol))
        return <Navigate to="/dashboard" replace />;

    return children
}

export default PrivateRoute