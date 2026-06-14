import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <div className="container vh-100 d-flex justify-content-center align-items-center">

            <div className="text-center">

                <h1
                    className="display-1 fw-bold text-primary"
                >
                    404
                </h1>

                <h2 className="mb-3">
                    Sayfa Bulunamadı
                </h2>

                <p className="text-muted mb-4">
                    Aradığınız sayfa mevcut değil veya taşınmış olabilir.
                </p>

                <div className="d-flex justify-content-center gap-3">

                    <Link
                        to="/dashboard"
                        className="btn btn-primary"
                    >
                        Dashboard'a Dön
                    </Link>

                    <Link
                        to="/login"
                        className="btn btn-outline-secondary"
                    >
                        Giriş Sayfası
                    </Link>

                </div>

                <div className="mt-5">
                    <small className="text-muted">
                        © 2025 Hastane Bilgi Yönetim Sistemi
                    </small>
                </div>

            </div>

        </div>
    );
};

export default NotFoundPage;