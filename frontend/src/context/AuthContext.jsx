import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            axios.get('/api/auth/me')
                .then(res => setUser(res.data.user))
                .catch(() => {
                    localStorage.removeItem('token')
                    delete axios.defaults.headers.common['Authorization']
                    setUser(null)
                })
                .finally(() => { setLoading(false) })
        } else {
            setLoading(false)
        }
    }, [])

    const login = async (email, sifre) => {
        const res = await axios.post('/api/auth/login', { email, sifre })
        localStorage.setItem('token', res.data.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
        setUser(res.data.user)
        return res.data.user.rol
    }

    const logout = () => {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}
