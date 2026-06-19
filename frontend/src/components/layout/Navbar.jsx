import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";



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
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const pageTitle = pageTitles[location.pathname] || "HBYS Panel";
    const role = user?.rol || "Anonim";
    const actionButtonText = actionButtons[location.pathname];

    return (
        <nav className="navbar bg-body-tertiary border-bottom px-4 shadow-sm">
            <span className="navbar-brand fw-bold text-primary mb-0">
                {pageTitle}
            </span>

            <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                onClick={toggleTheme}
            >
                <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
                {theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
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
                    <button 
                        className="btn btn-primary"
                        onClick={() => window.dispatchEvent(new CustomEvent('navbar-action-click'))}
                    >
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