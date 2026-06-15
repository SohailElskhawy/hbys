const StatCard = ({ title, value, icon, variant = "primary" }) => {
    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                    <p className="text-muted mb-1">{title}</p>
                    <h3 className="fw-bold mb-0">{value}</h3>
                </div>

                <div className={`bg-${variant} bg-opacity-10 text-${variant} rounded-circle d-flex justify-content-center align-items-center`}
                    style={{ width: "50px", height: "50px" }}
                >
                    <i className={`bi ${icon} fs-4`}></i>
                </div>
            </div>
        </div>
    );
};

export default StatCard;