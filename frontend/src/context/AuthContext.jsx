// it creates the context by createContext() & assign it to value
// then use useContext() to fetch the data if the component inside the <Context.Provider>

import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => { //  children = components wrapped inside AuthProvider
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)


    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.get('/api/auth/me')
                .then(res => setUser(res.data.user))
                .catch(() => {
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                    setUser(null);
                })
                .finally(() => { setLoading(false) })
        }
        else {
            setLoading(false);
        }

        // check the token 
        // if token exist 
        // fetch user's data 
        // store it in the useState 
        // after all setloading to false 
    }, [])



    // login func (email,password ) => returns role 
    // stores the token in localStorage 


    // logout func 
    // delete the token from localStorage

    const login = async (email, sifre) => {
        const res = await axios.post('/api/auth/login', { email, sifre });
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        return res.data.user.rol; // 'admin' | 'doktor' |'hasta'
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };


    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )

}


