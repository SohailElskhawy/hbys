import React from 'react'
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';


const LoginPage = () => {
    // keep track of the email & password values [+]
    // use the email & password values as an argument for the login() for auth [+]
    // check if the login page leads to 'dashboard' page after login in [+]
    // check if token has been saved in the localstorage after the login (try to reload the page)

    // prevent default form refresh
    // use useAuth() to get login()
    // use useNavigate() to redirect
    // add error state for wrong email/password
    // add loading/submitting state to disable button

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()


    const handleSubmit = async (event) => {
        event.preventDefault()

        try {
            setError('')
            setSubmitting(true)

            await login(email, password)

            navigate('/dashboard')
        } catch (err) {
            setError('Email veya şifre hatalı')
        } finally {
            setSubmitting(false)
        }
    }


    return (
        <div className="container-fluid vh-100 d-flex justify-content-center align-items-center bg-light">

            <div className="card shadow p-4" style={{ width: "800px" }}>

                <div className="text-center mb-4">
                    <h2 className="fw-bold text-primary">
                        Hastane Bilgi Yönetim Sistemi
                    </h2>

                    <p className="text-muted mb-0">
                        Kullanıcı Girişi
                    </p>
                </div>

                <form onSubmit={handleSubmit}>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="form-label">
                            E-posta Adresi
                        </label>

                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@mail.com"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Şifre
                        </label>

                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Şifrenizi giriniz"
                            required
                        />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <div className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                checked={checked}
                                onChange={(e) => setChecked(e.target.checked)}
                                id="rememberMe"
                            />

                            <label
                                className="form-check-label"
                                htmlFor="rememberMe"
                            >
                                Beni Hatırla
                            </label>
                        </div>

                        <a href="#" className="text-decoration-none">
                            Şifremi Unuttum?
                        </a>

                    </div>

                    <div className="d-grid">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary"
                        >
                            {submitting
                                ? "Giriş Yapılıyor..."
                                : "Giriş Yap"}
                        </button>
                    </div>

                    <hr />

                    <div className="text-center">
                        <small className="text-muted">
                            Hesabınız yok mu?
                        </small>

                        <br />

                        <a href="#" className="text-decoration-none">
                            Admin ile iletişime geçin
                        </a>
                    </div>

                </form>

                <div className="text-center mt-4">
                    <small className="text-muted">
                        © 2025 HBYS — Tüm hakları saklıdır
                    </small>
                </div>

            </div>

        </div>
    )
}

export default LoginPage