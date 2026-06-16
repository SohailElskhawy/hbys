import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


const pageTitles = {
    "/dashboard": "Dashboard",
    "/hastalar": "Hasta Yönetimi",
    "/doktorlar": "Doktor Yönetimi",
    "/randevular": "Randevu Yönetimi",
    "/bolumler": "Bölüm Yönetimi",
    "/istatistik": "İstatistikler",
    "/profil": "Profilim",
};

const actionButtons = {
    "/hastalar": "Yeni Hasta",
    "/doktorlar": "Yeni Doktor",
    "/randevular": "Yeni Randevu",
    "/bolumler": "Yeni Bölüm",
};

const Navbar = () => {
    const { user } = useAuth();
    const location = useLocation();

    const pageTitle = pageTitles[location.pathname] || "HBYS Panel";
    const role = user?.rol || "Anonim";
    const actionButtonText = actionButtons[location.pathname];

    return (
        <nav className="navbar bg-white border-bottom px-4 shadow-sm">
            <span className="navbar-brand fw-bold text-primary mb-0">
                {pageTitle}
            </span>

            <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                disabled
            >
                <i className="bi bi-circle-half"></i>
                Tema
            </button>

            <div className="ms-auto d-flex align-items-center gap-3">
                {location.pathname === "/dashboard" && (
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Arama..."
                        style={{ width: "260px" }}
                    />
                )}

                {actionButtonText && (
                    <button className="btn btn-primary">
                        + {actionButtonText}
                    </button>
                )}



                <span className="badge bg-secondary text-capitalize">
                    {role}
                </span>
            </div>
        </nav>
    );
};

export default Navbar;