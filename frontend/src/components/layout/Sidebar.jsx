import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import 'bootstrap/dist/css/bootstrap.min.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const role = user?.rol || "admin"; // admin for dev purpose 

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const menuByRole = {
        admin: [
            { title: "Dashboard", path: "/dashboard" },
            { title: "Hastalar", path: "/hastalar" },
            { title: "Doktorlar", path: "/doktorlar" },
            { title: "Randevular", path: "/randevular" },
            { title: "Bölümler", path: "/bolumler" },
            { title: "İstatistikler", path: "/istatistik" },
            { title: "Profil", path: "/profil" },
        ],

        doktor: [
            { title: "Dashboard", path: "/dashboard" },
            { title: "Randevularım", path: "/randevular" },
            { title: "Hastalarım", path: "/hastalar" },
            { title: "Bölümler", path: "/bolumler" },
            { title: "Profil", path: "/profil" },
        ],

        hasta: [
            { title: "Dashboard", path: "/dashboard" },
            { title: "Doktorlar", path: "/doktorlar" },
            { title: "Randevularım", path: "/randevular" },
            { title: "Bölümler", path: "/bolumler" },
            { title: "Profil", path: "/profil" },
        ],
    };

    const menuItems = menuByRole[role] || menuByRole.admin;

    return (
        <aside
            className="bg-dark text-white d-flex flex-column"
            style={{ width: "260px", minHeight: "100vh" }}
        >
            <div className="p-4 border-bottom">
                <h3 className="fw-bold mb-2">HBYS</h3>
                <span className="badge bg-secondary text-capitalize">
                    {role}
                </span>
            </div>

            <div className="flex-grow-1 p-3">
                <ul className="nav flex-column">
                    {menuItems.map((item) => (
                        <li key={item.path} className="nav-item mb-2">
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-link rounded ${isActive
                                        ? "bg-primary text-white"
                                        : "text-light"
                                    }`
                                }
                            >
                                {item.title}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="p-3 border-top">
                <button
                    className="btn btn-outline-light w-100"
                    onClick={handleLogout}
                >
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;