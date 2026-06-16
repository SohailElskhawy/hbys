import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import { loginApi, getMeApi } from '../api/auth.api'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            getMeApi()
                .then(data => setUser(data.user))
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
        const data = await loginApi(email, sifre)
        localStorage.setItem('token', data.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        setUser(data.user)
        return data.user.rol
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

