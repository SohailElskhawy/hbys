import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage, DashboardPage, NotFoundPage, IstatistikPage, ProfilPage, BolumlerPage, RandevularPage, DoktorlarPage, HastalarPage } from '../pages/index'
import PrivateRoute from './PrivateRoute'
const AppRouter = () => {
    return (
        <BrowserRouter>

            <Routes>
                <Route path='/' element={<LoginPage />} />
                <Route path='/login' element={<LoginPage />} />
                <Route path='/loginpage' element={<LoginPage />} />
                <Route path='/dashboard' element={
                    <PrivateRoute>
                        <DashboardPage />
                    </PrivateRoute>} />

                {/* <Route path="/hastalar" element={<Hastalar />} />
                <Route path="/doktorlar" element={<Doktorlar />} />
                <Route path="/randevular" element={<Randevular />} />
                <Route path="/bolumler" element={<Bolumler />} />
                <Route path="/profil" element={<Profil />} />
                <Route path="/istatistik" element={<Istatistik />} /> */}
                <Route path='*' element={<NotFoundPage />} />

            </Routes>

        </BrowserRouter>

    )
}

export default AppRouter