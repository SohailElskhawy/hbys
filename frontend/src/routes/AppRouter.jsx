import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login, Dashboard, NotFound, Istatistik, Profil, Bolumler, Randevular, Doktorlar, Hastalar } from '../pages/index'

const AppRouter = () => {
    return (
        <BrowserRouter>

            <Routes>
                <Route path='/' element={<Login />} />
                <Route path='/login' element={<Login />} />
                <Route path='/dashboard' element={<Dashboard />} />

                <Route path="/hastalar" element={<Hastalar />} />
                <Route path="/doktorlar" element={<Doktorlar />} />
                <Route path="/randevular" element={<Randevular />} />
                <Route path="/bolumler" element={<Bolumler />} />
                <Route path="/profil" element={<Profil />} />
                <Route path="/istatistik" element={<Istatistik />} />
                <Route path='*' element={<NotFound />} />

            </Routes>

        </BrowserRouter>

    )
}

export default AppRouter