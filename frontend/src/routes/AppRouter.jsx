import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage, DashboardPage, NotFoundPage, IstatistikPage, ProfilPage, BolumlerPage, RandevularPage, DoktorlarPage, HastalarPage } from '../pages/index'
import PrivateRoute from './PrivateRoute'

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/loginpage" element={<LoginPage />} />
                <Route path="/dashboard" element={
                    <PrivateRoute>
                        <DashboardPage />
                    </PrivateRoute>
                } />
                <Route path="/hastalar" element={
                    <PrivateRoute roles={['admin', 'doktor']}>
                        <HastalarPage />
                    </PrivateRoute>
                } />
                <Route path="/doktorlar" element={
                    <PrivateRoute roles={['admin', 'hasta']}>
                        <DoktorlarPage />
                    </PrivateRoute>
                } />
                <Route path="/randevular" element={
                    <PrivateRoute>
                        <RandevularPage />
                    </PrivateRoute>
                } />
                <Route path="/bolumler" element={
                    <PrivateRoute>
                        <BolumlerPage />
                    </PrivateRoute>
                } />
                <Route path="/profil" element={
                    <PrivateRoute>
                        <ProfilPage />
                    </PrivateRoute>
                } />
                <Route path="/istatistik" element={
                    <PrivateRoute roles={['admin']}>
                        <IstatistikPage />
                    </PrivateRoute>
                } />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter